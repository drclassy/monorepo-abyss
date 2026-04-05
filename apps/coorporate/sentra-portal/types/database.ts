/**
 * PORTAL Sentra — Database GUI Types
 * Database management and query interface
 */

// ============================================================================
// Connection Types
// ============================================================================

export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite'

export interface DatabaseConnection {
  id: string
  name: string
  type: DatabaseType
  host: string
  port: number
  database: string
  username: string
  // Password stored in encrypted vault, retrieved at runtime
  password?: string
  ssl?: boolean
  serviceId?: string // Link to managed service
  projectId?: string // Link to project
  createdAt: Date
  lastUsedAt?: Date
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  latency?: number // ms
  version?: string
}

// ============================================================================
// Schema Types
// ============================================================================

export interface TableInfo {
  name: string
  schema: string
  type: 'table' | 'view'
  rowCount?: number
  size?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  foreignKey?: {
    table: string
    column: string
  }
  isUnique: boolean
  isIndexed: boolean
  comment?: string
}

export interface IndexInfo {
  name: string
  type: string // PRIMARY, UNIQUE, INDEX
  columns: string[]
  isUnique: boolean
}

export interface ForeignKeyInfo {
  name: string
  column: string
  referencedTable: string
  referencedColumn: string
  onUpdate: string
  onDelete: string
}

// ============================================================================
// Query Types
// ============================================================================

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTime: number // ms
  affectedRows?: number
  command?: string
}

export interface QueryHistory {
  id: string
  connectionId: string
  query: string
  results?: QueryResult
  error?: string
  executedAt: Date
  executionTime?: number
}

export interface SavedQuery {
  id: string
  name: string
  connectionId: string
  query: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Editor Types
// ============================================================================

export interface SQLEditorState {
  content: string
  cursorPosition: { line: number; column: number }
  selection?: { start: number; end: number }
  history: string[]
  historyIndex: number
}

export interface AutoCompleteItem {
  label: string
  type: 'table' | 'column' | 'function' | 'keyword'
  detail?: string
  documentation?: string
}

// ============================================================================
// Export/Import Types
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'sql' | 'excel'

export interface ExportOptions {
  format: ExportFormat
  tableName?: string
  query?: string
  includeHeaders: boolean
  delimiter?: string
  encoding?: string
}

export interface ImportOptions {
  format: ExportFormat
  tableName: string
  createTable: boolean
  truncateBefore: boolean
  encoding?: string
}
