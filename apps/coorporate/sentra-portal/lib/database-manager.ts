/**
 * PORTAL Sentra — Database Manager
 * Universal database connection and query management
 */

import 'server-only'

import { EventEmitter } from 'events'
import type {
  ColumnInfo,
  ConnectionTestResult,
  DatabaseConnection,
  DatabaseType,
  IndexInfo,
  QueryHistory,
  QueryResult,
  TableInfo,
} from '@/types/database'
import { db as sqliteDb } from './db'

// ============================================================================
// Mock Implementations (would use actual DB drivers in production)
// ============================================================================

// PostgreSQL driver would be: import { Client } from 'pg';
// MySQL driver would be: import { createConnection } from 'mysql2/promise';
// MongoDB driver would be: import { MongoClient } from 'mongodb';

interface MockConnection {
  type: DatabaseType
  config: DatabaseConnection
  connected: boolean
}

// ============================================================================
// Database Manager Class
// ============================================================================

class DatabaseManager extends EventEmitter {
  private connections = new Map<string, DatabaseConnection>()
  private activeConnections = new Map<string, MockConnection>()
  private queryHistory: QueryHistory[] = []
  private historyLimit = 100

  constructor() {
    super()
    this.loadConnections()
  }

  // -------------------------------------------------------------------------
  // Connection Management
  // -------------------------------------------------------------------------

  private loadConnections(): void {
    try {
      // Load from SQLite
      const rows = sqliteDb()
        .prepare('SELECT * FROM database_connections ORDER BY created_at DESC')
        .all() as Array<{
        id: string
        name: string
        type: DatabaseType
        host: string
        port: number
        database: string
        username: string
        password_encrypted?: string
        ssl: number
        service_id?: string
        project_id?: string
        created_at: string
        last_used_at?: string
      }>

      for (const row of rows) {
        const conn: DatabaseConnection = {
          id: row.id,
          name: row.name,
          type: row.type,
          host: row.host,
          port: row.port,
          database: row.database,
          username: row.username,
          ssl: !!row.ssl,
          serviceId: row.service_id,
          projectId: row.project_id,
          createdAt: new Date(row.created_at),
          lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
        }
        this.connections.set(row.id, conn)
      }
    } catch (error) {
      console.log('[DatabaseManager] No existing connections or table not created yet')
      this.createConnectionsTable()
    }
  }

  private createConnectionsTable(): void {
    try {
      sqliteDb().exec(`
        CREATE TABLE IF NOT EXISTS database_connections (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          host TEXT NOT NULL,
          port INTEGER NOT NULL,
          database TEXT NOT NULL,
          username TEXT NOT NULL,
          password_encrypted TEXT,
          ssl INTEGER DEFAULT 0,
          service_id TEXT,
          project_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_used_at DATETIME,
          FOREIGN KEY (service_id) REFERENCES services(id),
          FOREIGN KEY (project_id) REFERENCES projects(id)
        );

        CREATE INDEX IF NOT EXISTS idx_db_conn_service ON database_connections(service_id);
        CREATE INDEX IF NOT EXISTS idx_db_conn_project ON database_connections(project_id);
      `)
    } catch (error) {
      console.error('[DatabaseManager] Failed to create connections table:', error)
    }
  }

  async createConnection(
    config: Omit<DatabaseConnection, 'id' | 'createdAt'>
  ): Promise<DatabaseConnection> {
    const id = `db-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const connection: DatabaseConnection = {
      ...config,
      id,
      createdAt: new Date(),
    }

    // Save to database
    const stmt = sqliteDb().prepare(`
      INSERT INTO database_connections 
      (id, name, type, host, port, database, username, ssl, service_id, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      connection.name,
      connection.type,
      connection.host,
      connection.port,
      connection.database,
      connection.username,
      connection.ssl ? 1 : 0,
      connection.serviceId || null,
      connection.projectId || null
    )

    this.connections.set(id, connection)
    this.emit('connectionCreated', { connection })

    return connection
  }

  async testConnection(
    config: Omit<DatabaseConnection, 'id' | 'createdAt'>
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now()

    try {
      // In production, this would actually connect to the database
      // For now, simulate a successful connection for valid-looking configs
      await new Promise(resolve => setTimeout(resolve, 100))

      const latency = Date.now() - startTime

      // Mock validation
      if (!config.host || !config.port || !config.database) {
        return {
          success: false,
          message: 'Missing required connection parameters',
        }
      }

      return {
        success: true,
        message: 'Connection successful',
        latency,
        version: this.getMockVersion(config.type),
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }

  private getMockVersion(type: DatabaseType): string {
    const versions: Record<DatabaseType, string> = {
      postgresql: 'PostgreSQL 16.1',
      mysql: 'MySQL 8.0.35',
      mongodb: 'MongoDB 7.0.4',
      redis: 'Redis 7.2.3',
      sqlite: 'SQLite 3.44.0',
    }
    return versions[type] || 'Unknown'
  }

  getConnection(id: string): DatabaseConnection | undefined {
    return this.connections.get(id)
  }

  getAllConnections(): DatabaseConnection[] {
    return Array.from(this.connections.values())
  }

  getConnectionsByProject(projectId: string): DatabaseConnection[] {
    return this.getAllConnections().filter(c => c.projectId === projectId)
  }

  getConnectionsByService(serviceId: string): DatabaseConnection[] {
    return this.getAllConnections().filter(c => c.serviceId === serviceId)
  }

  async deleteConnection(id: string): Promise<void> {
    // Close active connection if exists
    await this.disconnect(id)

    // Remove from database
    const stmt = sqliteDb().prepare('DELETE FROM database_connections WHERE id = ?')
    stmt.run(id)

    this.connections.delete(id)
    this.emit('connectionDeleted', { id })
  }

  async disconnect(id: string): Promise<void> {
    const activeConn = this.activeConnections.get(id)
    if (activeConn) {
      // In production, would actually close connection
      activeConn.connected = false
      this.activeConnections.delete(id)
    }
  }

  // -------------------------------------------------------------------------
  // Schema Introspection
  // -------------------------------------------------------------------------

  async getTables(connectionId: string): Promise<TableInfo[]> {
    const conn = this.connections.get(connectionId)
    if (!conn) throw new Error('Connection not found')

    // Mock data - in production would query information_schema
    const mockTables: TableInfo[] = [
      {
        name: 'users',
        schema: 'public',
        type: 'table',
        rowCount: 15420,
        size: '2.4 MB',
      },
      {
        name: 'projects',
        schema: 'public',
        type: 'table',
        rowCount: 89,
        size: '128 KB',
      },
      {
        name: 'logs',
        schema: 'public',
        type: 'table',
        rowCount: 125000,
        size: '45 MB',
      },
    ]

    return mockTables
  }

  async getTableSchema(
    connectionId: string,
    tableName: string
  ): Promise<{
    columns: ColumnInfo[]
    indexes: IndexInfo[]
  }> {
    const conn = this.connections.get(connectionId)
    if (!conn) throw new Error('Connection not found')

    // Mock schema for users table
    if (tableName === 'users') {
      return {
        columns: [
          {
            name: 'id',
            type: 'uuid',
            nullable: false,
            isPrimaryKey: true,
            isForeignKey: false,
            isUnique: true,
            isIndexed: true,
          },
          {
            name: 'email',
            type: 'varchar(255)',
            nullable: false,
            isPrimaryKey: false,
            isForeignKey: false,
            isUnique: true,
            isIndexed: true,
          },
          {
            name: 'name',
            type: 'varchar(255)',
            nullable: false,
            isPrimaryKey: false,
            isForeignKey: false,
            isUnique: false,
            isIndexed: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            nullable: false,
            defaultValue: 'now()',
            isPrimaryKey: false,
            isForeignKey: false,
            isUnique: false,
            isIndexed: true,
          },
        ],
        indexes: [
          { name: 'users_pkey', type: 'PRIMARY', columns: ['id'], isUnique: true },
          { name: 'users_email_key', type: 'UNIQUE', columns: ['email'], isUnique: true },
          { name: 'users_created_at_idx', type: 'INDEX', columns: ['created_at'], isUnique: false },
        ],
      }
    }

    return { columns: [], indexes: [] }
  }

  // -------------------------------------------------------------------------
  // Query Execution
  // -------------------------------------------------------------------------

  async executeQuery(
    connectionId: string,
    query: string,
    params?: unknown[]
  ): Promise<QueryResult> {
    const startTime = Date.now()
    const conn = this.connections.get(connectionId)
    if (!conn) throw new Error('Connection not found')

    // Update last used
    conn.lastUsedAt = new Date()
    sqliteDb()
      .prepare('UPDATE database_connections SET last_used_at = ? WHERE id = ?')
      .run(conn.lastUsedAt.toISOString(), connectionId)

    try {
      // In production, this would execute the actual query
      // Mock implementation for SELECT queries
      const normalizedQuery = query.trim().toLowerCase()

      let result: QueryResult

      if (normalizedQuery.startsWith('select')) {
        // Mock SELECT result
        result = {
          columns: ['id', 'email', 'name', 'created_at'],
          rows: [
            { id: '1', email: 'user1@example.com', name: 'User One', created_at: '2024-01-15' },
            { id: '2', email: 'user2@example.com', name: 'User Two', created_at: '2024-01-16' },
            { id: '3', email: 'user3@example.com', name: 'User Three', created_at: '2024-01-17' },
          ],
          rowCount: 3,
          executionTime: Date.now() - startTime,
          command: 'SELECT',
        }
      } else if (normalizedQuery.startsWith('insert')) {
        result = {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: Date.now() - startTime,
          affectedRows: 1,
          command: 'INSERT',
        }
      } else if (normalizedQuery.startsWith('update')) {
        result = {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: Date.now() - startTime,
          affectedRows: 2,
          command: 'UPDATE',
        }
      } else if (normalizedQuery.startsWith('delete')) {
        result = {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: Date.now() - startTime,
          affectedRows: 1,
          command: 'DELETE',
        }
      } else {
        result = {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: Date.now() - startTime,
          command: 'UNKNOWN',
        }
      }

      // Save to history
      this.addToHistory({
        id: `qh-${Date.now()}`,
        connectionId,
        query,
        results: result,
        executedAt: new Date(),
        executionTime: result.executionTime,
      })

      this.emit('queryExecuted', { connectionId, query, result })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Query failed'

      this.addToHistory({
        id: `qh-${Date.now()}`,
        connectionId,
        query,
        error: errorMessage,
        executedAt: new Date(),
        executionTime: Date.now() - startTime,
      })

      throw error
    }
  }

  private addToHistory(entry: QueryHistory): void {
    this.queryHistory.unshift(entry)
    if (this.queryHistory.length > this.historyLimit) {
      this.queryHistory = this.queryHistory.slice(0, this.historyLimit)
    }
  }

  getQueryHistory(connectionId?: string, limit = 50): QueryHistory[] {
    let history = this.queryHistory
    if (connectionId) {
      history = history.filter(h => h.connectionId === connectionId)
    }
    return history.slice(0, limit)
  }

  // -------------------------------------------------------------------------
  // Data Operations
  // -------------------------------------------------------------------------

  async getTableData(
    connectionId: string,
    tableName: string,
    options: {
      limit?: number
      offset?: number
      orderBy?: string
      orderDirection?: 'asc' | 'desc'
      where?: string
    } = {}
  ): Promise<QueryResult> {
    const { limit = 100, offset = 0, orderBy, orderDirection = 'asc', where } = options

    let query = `SELECT * FROM "${tableName}"`

    if (where) {
      query += ` WHERE ${where}`
    }

    if (orderBy) {
      query += ` ORDER BY "${orderBy}" ${orderDirection.toUpperCase()}`
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`

    return this.executeQuery(connectionId, query)
  }

  // -------------------------------------------------------------------------
  // Export/Import
  // -------------------------------------------------------------------------

  async exportTable(
    connectionId: string,
    tableName: string,
    format: 'csv' | 'json' | 'sql'
  ): Promise<string> {
    const result = await this.getTableData(connectionId, tableName, { limit: 10000 })

    switch (format) {
      case 'csv':
        return this.toCSV(result)
      case 'json':
        return JSON.stringify(result.rows, null, 2)
      case 'sql':
        return this.toSQLInsert(tableName, result)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  private toCSV(result: QueryResult): string {
    const headers = result.columns.join(',')
    const rows = result.rows.map(row =>
      result.columns
        .map(col => {
          const val = row[col]
          if (val === null) return ''
          const str = String(val)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(',')
    )
    return [headers, ...rows].join('\n')
  }

  private toSQLInsert(tableName: string, result: QueryResult): string {
    if (result.rows.length === 0) return ''

    const columns = result.columns.map(c => `"${c}"`).join(', ')
    const values = result.rows.map(row => {
      const vals = result.columns.map(col => {
        const val = row[col]
        if (val === null) return 'NULL'
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
        return String(val)
      })
      return `(${vals.join(', ')})`
    })

    return `INSERT INTO "${tableName}" (${columns}) VALUES\n${values.join(',\n')};`
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const databaseManager = new DatabaseManager()
