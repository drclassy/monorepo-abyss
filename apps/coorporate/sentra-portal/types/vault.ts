/**
 * PORTAL Sentra — Environment Vault Types
 * Encrypted environment variable management
 */

// ============================================================================
// Environment Variable Types
// ============================================================================

export type EnvVariableScope = 'project' | 'service' | 'global'

export interface EnvVariable {
  id: string
  key: string
  value: string // Always encrypted in storage
  isEncrypted: boolean
  projectId?: string
  serviceId?: string
  scope: EnvVariableScope
  description?: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

export interface EnvVariableInput {
  key: string
  value: string
  isEncrypted?: boolean
  description?: string
}

export interface EnvVariableDisplay {
  id: string
  key: string
  value: string // Decrypted value (only when requested)
  isEncrypted: boolean
  isRevealed: boolean
  scope: EnvVariableScope
  description?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Vault Configuration
// ============================================================================

export interface VaultConfig {
  masterKeyHash?: string // PBKDF2 hash of master password
  isInitialized: boolean
  lastRotation?: Date
}

export interface VaultKey {
  id: string
  keyData: string // Encrypted key data
  createdAt: Date
  algorithm: 'aes-256-gcm'
}

// ============================================================================
// Encryption Types
// ============================================================================

export interface EncryptedData {
  ciphertext: string // Base64 encoded
  iv: string // Base64 encoded (16 bytes for AES-GCM)
  tag: string // Base64 encoded authentication tag (16 bytes)
  salt?: string // Base64 encoded (for key derivation)
  algorithm: 'aes-256-gcm'
}

export interface EncryptionResult {
  encrypted: EncryptedData
  success: boolean
  error?: string
}

// ============================================================================
// API Types
// ============================================================================

export interface EnvBulkImportInput {
  variables: Array<{
    key: string
    value: string
  }>
  encryptAll?: boolean
  overwriteExisting?: boolean
}

export interface EnvExportOptions {
  includeValues: boolean
  decryptValues: boolean
  format: 'json' | 'env' | 'yaml'
}

export interface ProjectEnvSummary {
  projectId: string
  projectName: string
  variableCount: number
  encryptedCount: number
  lastUpdated?: Date
}
