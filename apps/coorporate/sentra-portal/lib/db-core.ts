/**
 * PORTAL Sentra — Database Core (script-safe)
 * SQLite with better-sqlite3. No server-only — safe for Node scripts.
 * Architected and built by Claudesy.
 */

import type { Database } from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import type {
  CreateProjectInput,
  LogEntry,
  LogRow,
  Project,
  ProjectRow,
  UpdateProjectInput,
} from '@/types'

// ============================================================================
// Lazy Database Initialization
// ============================================================================

let dbInstance: Database | null = null

function getDatabasePath(): string {
  if (process.env.DATABASE_URL) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return process.env.DATABASE_URL.replace(/^~/, join(process.cwd(), '.sentra'))
    }
    const { homedir } = require('os')
    return process.env.DATABASE_URL.replace('~', homedir())
  }
  return join(process.cwd(), '.sentra', 'data', 'sentra.db')
}

function getDatabase(): Database {
  if (dbInstance) return dbInstance
  if (typeof window !== 'undefined') {
    throw new Error('Database cannot be accessed from client side')
  }

  const DatabaseConstructor = require('better-sqlite3')
  const DB_PATH = getDatabasePath()
  const DATA_DIR = join(DB_PATH, '..')

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  const newDb = new DatabaseConstructor(DB_PATH) as Database
  dbInstance = newDb
  newDb.pragma('journal_mode = WAL')
  newDb.pragma('foreign_keys = ON')
  newDb.exec(SCHEMA)
  return newDb
}

// ============================================================================
// Schema
// ============================================================================

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  path TEXT NOT NULL,
  port INTEGER NOT NULL,
  start_command TEXT NOT NULL DEFAULT 'npm run dev',
  build_command TEXT NOT NULL DEFAULT 'npm run build',
  env_vars TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'stopped' CHECK (status IN ('stopped', 'starting', 'running', 'stopping', 'error')),
  pid INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stdout', 'stderr', 'system')),
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_logs_project_timestamp ON logs(project_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
`

// ============================================================================
// Row Mappers
// ============================================================================

function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    path: row.path,
    port: row.port,
    startCommand: row.start_command,
    buildCommand: row.build_command,
    envVars: JSON.parse(row.env_vars),
    status: row.status,
    pid: row.pid,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function mapLogRow(row: LogRow): LogEntry {
  return {
    id: row.id,
    projectId: row.project_id,
    type: row.type,
    message: row.message,
    timestamp: new Date(row.timestamp),
  }
}

// ============================================================================
// Repositories
// ============================================================================

export const ProjectRepository = {
  findAll(): Project[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC')
    const rows = stmt.all() as ProjectRow[]
    return rows.map(mapProjectRow)
  },

  findById(id: string): Project | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?')
    const row = stmt.get(id) as ProjectRow | undefined
    return row ? mapProjectRow(row) : null
  },

  findByPort(port: number): Project | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM projects WHERE port = ?')
    const row = stmt.get(port) as ProjectRow | undefined
    return row ? mapProjectRow(row) : null
  },

  create(input: CreateProjectInput & { id?: string }): Project {
    const db = getDatabase()
    const id = input.id || crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO projects (
        id, name, description, path, port,
        start_command, build_command, env_vars, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'stopped', ?)
    `)

    stmt.run(
      id,
      input.name,
      input.description ?? null,
      input.path,
      input.port,
      input.startCommand ?? 'npm run dev',
      input.buildCommand ?? 'npm run build',
      JSON.stringify(input.envVars ?? {}),
      now
    )

    return this.findById(id)!
  },

  update(id: string, input: UpdateProjectInput): Project | null {
    const existing = this.findById(id)
    if (!existing) return null

    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE projects SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        path = COALESCE(?, path),
        port = COALESCE(?, port),
        start_command = COALESCE(?, start_command),
        build_command = COALESCE(?, build_command),
        env_vars = COALESCE(?, env_vars),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(
      input.name ?? null,
      input.description ?? null,
      input.path ?? null,
      input.port ?? null,
      input.startCommand ?? null,
      input.buildCommand ?? null,
      input.envVars ? JSON.stringify(input.envVars) : null,
      id
    )

    return this.findById(id)
  },

  updateStatus(id: string, status: Project['status'], pid?: number | null): void {
    const db = getDatabase()
    const stmt = db.prepare(`
      UPDATE projects
      SET status = ?, pid = COALESCE(?, pid), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    stmt.run(status, pid ?? null, id)
  },

  delete(id: string): boolean {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },
}

export const LogRepository = {
  findRecent(limit: number = 15): LogEntry[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM logs
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    const rows = stmt.all(limit) as LogRow[]
    return rows.map(mapLogRow)
  },

  findByProject(projectId: string, limit: number = 100): LogEntry[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM logs
      WHERE project_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    const rows = stmt.all(projectId, limit) as LogRow[]
    return rows.map(mapLogRow).reverse()
  },

  create(projectId: string, type: LogEntry['type'], message: string): LogEntry {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO logs (project_id, type, message)
      VALUES (?, ?, ?)
    `)
    const result = stmt.run(projectId, type, message)

    return {
      id: result.lastInsertRowid as number,
      projectId,
      type,
      message,
      timestamp: new Date(),
    }
  },

  createMany(entries: Omit<LogEntry, 'id' | 'timestamp'>[]): void {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO logs (project_id, type, message)
      VALUES (?, ?, ?)
    `)

    const insertMany = db.transaction((items: Omit<LogEntry, 'id' | 'timestamp'>[]) => {
      for (const item of items) {
        stmt.run(item.projectId, item.type, item.message)
      }
    })

    insertMany(entries)
  },

  clearByProject(projectId: string): void {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM logs WHERE project_id = ?')
    stmt.run(projectId)
  },
}

export function checkDatabaseHealth(): { ok: boolean; message: string } {
  try {
    const db = getDatabase()
    db.prepare('SELECT 1').get()
    return { ok: true, message: 'Database connected' }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

export { getDatabase as db }
