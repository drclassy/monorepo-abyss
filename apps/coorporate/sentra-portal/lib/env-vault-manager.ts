/**
 * PORTAL Sentra — Environment Vault Manager
 * Secure storage and management of environment variables
 */

import 'server-only'

import { EventEmitter } from 'events'
import type {
  EnvVariable,
  EnvVariableInput,
  EnvVariableScope,
  ProjectEnvSummary,
} from '@/types/vault'
import { db } from './db'
import { encryptionManager } from './encryption-manager'

// ============================================================================
// Types
// ============================================================================

interface EnvVariableRow {
  id: string
  key: string
  value: string
  is_encrypted: number
  project_id?: string
  service_id?: string
  scope: string
  description?: string
  created_at: string
  updated_at: string
  created_by?: string
}

// ============================================================================
// Environment Vault Manager
// ============================================================================

class EnvVaultManager extends EventEmitter {
  private initialized = false

  constructor() {
    super()
    this.initializeSchema()
  }

  // -------------------------------------------------------------------------
  // Schema Initialization
  // -------------------------------------------------------------------------

  private initializeSchema(): void {
    try {
      db().exec(`
        CREATE TABLE IF NOT EXISTS env_variables (
          id TEXT PRIMARY KEY,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          is_encrypted INTEGER NOT NULL DEFAULT 1,
          project_id TEXT,
          service_id TEXT,
          scope TEXT NOT NULL DEFAULT 'project',
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_env_project ON env_variables(project_id);
        CREATE INDEX IF NOT EXISTS idx_env_service ON env_variables(service_id);
        CREATE INDEX IF NOT EXISTS idx_env_scope ON env_variables(scope);
        CREATE INDEX IF NOT EXISTS idx_env_key ON env_variables(key);

        CREATE TABLE IF NOT EXISTS vault_config (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          master_key_hash TEXT,
          is_initialized INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `)
      this.initialized = true
    } catch (error) {
      console.error('[EnvVaultManager] Failed to initialize schema:', error)
    }
  }

  // -------------------------------------------------------------------------
  // Vault Configuration
  // -------------------------------------------------------------------------

  isVaultInitialized(): boolean {
    try {
      const row = db().prepare('SELECT is_initialized FROM vault_config WHERE id = 1').get() as
        | { is_initialized: number }
        | undefined
      return row?.is_initialized === 1
    } catch {
      return false
    }
  }

  initializeVault(masterPassword: string): void {
    const keyHash = encryptionManager.generateMasterKeyHash(masterPassword)

    db()
      .prepare(`
      INSERT OR REPLACE INTO vault_config (id, master_key_hash, is_initialized, updated_at)
      VALUES (1, ?, 1, CURRENT_TIMESTAMP)
    `)
      .run(keyHash)

    encryptionManager.initialize(masterPassword)
    this.emit('vaultInitialized')
  }

  unlockVault(masterPassword: string): boolean {
    const row = db().prepare('SELECT master_key_hash FROM vault_config WHERE id = 1').get() as
      | { master_key_hash: string }
      | undefined

    if (!row) return false

    const isValid = encryptionManager.verifyMasterPassword(masterPassword, row.master_key_hash)

    if (isValid) {
      encryptionManager.initialize(masterPassword)
      this.emit('vaultUnlocked')
      return true
    }

    return false
  }

  lockVault(): void {
    encryptionManager.clear()
    this.emit('vaultLocked')
  }

  isUnlocked(): boolean {
    return encryptionManager.getIsInitialized()
  }

  // -------------------------------------------------------------------------
  // CRUD Operations
  // -------------------------------------------------------------------------

  getVariables(scope: EnvVariableScope, projectId?: string, serviceId?: string): EnvVariable[] {
    let query = 'SELECT * FROM env_variables WHERE scope = ?'
    const params: (string | undefined)[] = [scope]

    if (projectId) {
      query += ' AND project_id = ?'
      params.push(projectId)
    }

    if (serviceId) {
      query += ' AND service_id = ?'
      params.push(serviceId)
    }

    query += ' ORDER BY key ASC'

    const rows = db()
      .prepare(query)
      .all(...params) as EnvVariableRow[]
    return rows.map(this.mapRowToVariable)
  }

  getVariable(id: string): EnvVariable | null {
    const row = db().prepare('SELECT * FROM env_variables WHERE id = ?').get(id) as
      | EnvVariableRow
      | undefined

    return row ? this.mapRowToVariable(row) : null
  }

  getVariableByKey(key: string, scope: EnvVariableScope, projectId?: string): EnvVariable | null {
    let query = 'SELECT * FROM env_variables WHERE key = ? AND scope = ?'
    const params: (string | undefined)[] = [key, scope]

    if (projectId) {
      query += ' AND project_id = ?'
      params.push(projectId)
    }

    const row = db()
      .prepare(query)
      .get(...params) as EnvVariableRow | undefined
    return row ? this.mapRowToVariable(row) : null
  }

  createVariable(
    input: EnvVariableInput,
    scope: EnvVariableScope,
    projectId?: string,
    serviceId?: string
  ): EnvVariable {
    if (!this.isUnlocked()) {
      throw new Error('Vault is locked. Please unlock first.')
    }

    // Check for duplicate key
    const existing = this.getVariableByKey(input.key, scope, projectId)
    if (existing) {
      throw new Error(`Variable "${input.key}" already exists`)
    }

    const id = crypto.randomUUID()
    const isEncrypted = input.isEncrypted !== false // Default to encrypted
    const now = new Date().toISOString()

    // Encrypt value if requested
    let storedValue = input.value
    if (isEncrypted) {
      storedValue = encryptionManager.encryptToString(input.value)
    }

    db()
      .prepare(`
      INSERT INTO env_variables 
      (id, key, value, is_encrypted, project_id, service_id, scope, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .run(
        id,
        input.key,
        storedValue,
        isEncrypted ? 1 : 0,
        projectId,
        serviceId,
        scope,
        input.description || null,
        now,
        now
      )

    const variable = this.getVariable(id)
    if (!variable) {
      throw new Error('Failed to create variable')
    }

    this.emit('variableCreated', { variable })
    return variable
  }

  updateVariable(id: string, input: Partial<EnvVariableInput>): EnvVariable {
    if (!this.isUnlocked()) {
      throw new Error('Vault is locked. Please unlock first.')
    }

    const existing = this.getVariable(id)
    if (!existing) {
      throw new Error('Variable not found')
    }

    const updates: string[] = []
    const params: (string | number | undefined)[] = []

    if (input.value !== undefined) {
      updates.push('value = ?')
      const storedValue = existing.isEncrypted
        ? encryptionManager.encryptToString(input.value)
        : input.value
      params.push(storedValue)
    }

    if (input.description !== undefined) {
      updates.push('description = ?')
      params.push(input.description)
    }

    updates.push('updated_at = ?')
    params.push(new Date().toISOString())

    params.push(id)

    db()
      .prepare(`
      UPDATE env_variables 
      SET ${updates.join(', ')}
      WHERE id = ?
    `)
      .run(...params)

    const updated = this.getVariable(id)
    if (!updated) {
      throw new Error('Failed to update variable')
    }

    this.emit('variableUpdated', { variable: updated })
    return updated
  }

  deleteVariable(id: string): void {
    const existing = this.getVariable(id)
    if (!existing) {
      throw new Error('Variable not found')
    }

    db().prepare('DELETE FROM env_variables WHERE id = ?').run(id)
    this.emit('variableDeleted', { id })
  }

  deleteVariablesByProject(projectId: string): void {
    db().prepare('DELETE FROM env_variables WHERE project_id = ?').run(projectId)
    this.emit('variablesDeletedByProject', { projectId })
  }

  // -------------------------------------------------------------------------
  // Value Decryption
  // -------------------------------------------------------------------------

  decryptValue(variable: EnvVariable): string {
    if (!this.isUnlocked()) {
      throw new Error('Vault is locked')
    }

    if (!variable.isEncrypted) {
      return variable.value
    }

    return encryptionManager.decryptFromString(variable.value)
  }

  // -------------------------------------------------------------------------
  // Bulk Operations
  // -------------------------------------------------------------------------

  bulkImport(
    variables: Array<{ key: string; value: string }>,
    scope: EnvVariableScope,
    projectId?: string,
    options?: {
      encryptAll?: boolean
      overwriteExisting?: boolean
    }
  ): { created: number; updated: number; errors: string[] } {
    const results = { created: 0, updated: 0, errors: [] as string[] }

    for (const { key, value } of variables) {
      try {
        const existing = this.getVariableByKey(key, scope, projectId)

        if (existing) {
          if (options?.overwriteExisting) {
            this.updateVariable(existing.id, { value })
            results.updated++
          } else {
            results.errors.push(`Key "${key}" already exists`)
          }
        } else {
          this.createVariable(
            {
              key,
              value,
              isEncrypted: options?.encryptAll ?? true,
            },
            scope,
            projectId
          )
          results.created++
        }
      } catch (error) {
        results.errors.push(
          `Failed to import "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return results
  }

  exportVariables(
    scope: EnvVariableScope,
    projectId?: string,
    options?: {
      decryptValues?: boolean
      format?: 'json' | 'env'
    }
  ): string {
    const variables = this.getVariables(scope, projectId)

    const processedVars = variables.map(v => ({
      key: v.key,
      value:
        options?.decryptValues && v.isEncrypted
          ? this.decryptValue(v)
          : v.isEncrypted
            ? '***ENCRYPTED***'
            : v.value,
      isEncrypted: v.isEncrypted,
      description: v.description,
    }))

    if (options?.format === 'env') {
      return processedVars.map(v => `# ${v.description || v.key}\n${v.key}=${v.value}`).join('\n\n')
    }

    return JSON.stringify(processedVars, null, 2)
  }

  // -------------------------------------------------------------------------
  // Statistics
  // -------------------------------------------------------------------------

  getProjectSummary(projectId: string): ProjectEnvSummary | null {
    const row = db()
      .prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_encrypted = 1 THEN 1 ELSE 0 END) as encrypted,
        MAX(updated_at) as last_updated
      FROM env_variables 
      WHERE project_id = ?
    `)
      .get(projectId) as { total: number; encrypted: number; last_updated: string } | undefined

    if (!row) return null

    // Get project name
    const projectRow = db().prepare('SELECT name FROM projects WHERE id = ?').get(projectId) as
      | { name: string }
      | undefined

    return {
      projectId,
      projectName: projectRow?.name || 'Unknown',
      variableCount: row.total,
      encryptedCount: row.encrypted,
      lastUpdated: row.last_updated ? new Date(row.last_updated) : undefined,
    }
  }

  // -------------------------------------------------------------------------
  // Integration Helpers
  // -------------------------------------------------------------------------

  /**
   * Get environment variables as key-value object for use with services
   */
  getEnvForService(serviceId: string, projectId?: string): Record<string, string> {
    const env: Record<string, string> = {}

    // Get global variables
    const globalVars = this.getVariables('global')
    for (const v of globalVars) {
      env[v.key] = v.isEncrypted ? this.decryptValue(v) : v.value
    }

    // Get project variables
    if (projectId) {
      const projectVars = this.getVariables('project', projectId)
      for (const v of projectVars) {
        env[v.key] = v.isEncrypted ? this.decryptValue(v) : v.value
      }
    }

    // Get service-specific variables (highest priority)
    const serviceVars = this.getVariables('service', projectId, serviceId)
    for (const v of serviceVars) {
      env[v.key] = v.isEncrypted ? this.decryptValue(v) : v.value
    }

    return env
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private mapRowToVariable(row: EnvVariableRow): EnvVariable {
    return {
      id: row.id,
      key: row.key,
      value: row.value,
      isEncrypted: row.is_encrypted === 1,
      projectId: row.project_id,
      serviceId: row.service_id,
      scope: row.scope as EnvVariableScope,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const envVaultManager = new EnvVaultManager()
