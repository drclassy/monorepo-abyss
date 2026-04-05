/**
 * PORTAL Sentra — SQL Editor Component
 * Monaco-like SQL editor with syntax highlighting and autocomplete
 */

'use client'

import {
  ChevronDown,
  ChevronRight,
  Columns,
  Database,
  Download,
  History,
  Key,
  Loader2,
  Play,
  Save,
  Search,
  Table,
} from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ColumnInfo, QueryHistory, QueryResult, TableInfo } from '@/types/database'

// ============================================================================
// Types
// ============================================================================

interface SQLEditorProps {
  connectionId: string
  tables: TableInfo[]
  onExecute: (query: string) => Promise<QueryResult>
  onSave?: (name: string, query: string) => void
}

// ============================================================================
// Mock Syntax Highlighter (simplified)
// ============================================================================

const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'INSERT',
  'UPDATE',
  'DELETE',
  'CREATE',
  'DROP',
  'ALTER',
  'TABLE',
  'INDEX',
  'JOIN',
  'LEFT',
  'RIGHT',
  'INNER',
  'OUTER',
  'ON',
  'GROUP',
  'BY',
  'ORDER',
  'LIMIT',
  'OFFSET',
  'HAVING',
  'UNION',
  'ALL',
  'DISTINCT',
  'AS',
  'AND',
  'OR',
  'NOT',
  'NULL',
  'IS',
  'IN',
  'BETWEEN',
  'LIKE',
  'EXISTS',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
]

// ============================================================================
// Component
// ============================================================================

export function SQLEditor({
  connectionId,
  tables,
  onExecute,
  onSave,
}: SQLEditorProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<QueryHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showSchema, setShowSchema] = useState(true)
  const [activeTab, setActiveTab] = useState<'results' | 'messages'>('results')

  // Load query history on mount
  useEffect(() => {
    fetchHistory()
  }, [connectionId])

  const fetchHistory = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/database/history?connectionId=${connectionId}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setHistory(data.data.history)
        }
      }
    } catch {
      // Silent fail
    }
  }

  const handleExecute = useCallback(async (): Promise<void> => {
    if (!query.trim()) return

    setIsExecuting(true)
    setError(null)
    setResult(null)
    setActiveTab('results')

    try {
      const result = await onExecute(query)
      setResult(result)
      fetchHistory() // Refresh history
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed')
      setActiveTab('messages')
    } finally {
      setIsExecuting(false)
    }
  }, [query, onExecute])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleExecute()
      }
    },
    [handleExecute]
  )

  const insertTableName = (tableName: string): void => {
    setQuery(prev => prev + (prev ? ' ' : '') + `"${tableName}"`)
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !query.trim()}
            size="sm"
            className="gap-1"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Execute
            <span className="text-xs text-muted-foreground hidden sm:inline">(⌘+Enter)</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-1"
          >
            <History className="h-4 w-4" />
            History
          </Button>

          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSave('Query', query)}
              className="gap-1"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSchema(!showSchema)}
            className="gap-1"
          >
            <Database className="h-4 w-4" />
            {showSchema ? 'Hide' : 'Show'} Schema
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Schema Sidebar */}
        {showSchema && (
          <div className="w-64 border-r bg-muted/30 overflow-y-auto">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Table className="h-4 w-4" />
                Tables
              </h3>
            </div>
            <div className="p-2 space-y-1">
              {tables.map(table => (
                <button
                  key={table.name}
                  onClick={() => insertTableName(table.name)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2 group"
                >
                  <Table className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                  <span className="truncate">{table.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {table.rowCount?.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Query Input */}
          <div className="flex-1 p-3">
            <Textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter SQL query... (⌘+Enter to execute)"
              className="w-full h-full font-mono text-sm resize-none border-0 focus-visible:ring-0 p-0 bg-transparent"
              spellCheck={false}
            />
          </div>

          {/* Results Area */}
          <div className="flex-1 border-t min-h-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-3 border-b bg-muted/30">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 py-2 text-sm border-b-2 transition-colors ${
                  activeTab === 'results'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Results
                {result && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({result.rowCount} rows, {result.executionTime}ms)
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-3 py-2 text-sm border-b-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Messages
                {error && <span className="ml-1 text-xs text-destructive">(Error)</span>}
              </button>
            </div>

            {/* Tab Content */}
            <div className="h-[calc(100%-41px)] overflow-auto">
              {activeTab === 'results' ? (
                result ? (
                  <ResultsGrid result={result} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Execute a query to see results
                  </div>
                )
              ) : (
                <div className="p-4 font-mono text-sm">
                  {error ? (
                    <div className="text-destructive">{error}</div>
                  ) : result ? (
                    <div className="text-green-600">
                      Query executed successfully.
                      {result.affectedRows !== undefined && (
                        <span> {result.affectedRows} rows affected.</span>
                      )}
                      <span> ({result.executionTime}ms)</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No messages</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-72 border-l bg-muted/30 overflow-y-auto">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium">Query History</h3>
            </div>
            <div className="divide-y">
              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(item.query)}
                  className="w-full text-left p-3 hover:bg-accent text-sm"
                >
                  <div className="truncate font-mono text-xs text-muted-foreground mb-1">
                    {item.query.substring(0, 60)}
                    {item.query.length > 60 ? '...' : ''}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={item.error ? 'text-destructive' : 'text-green-600'}>
                      {item.error ? 'Error' : `${item.executionTime}ms`}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(item.executedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Results Grid Component
// ============================================================================

function ResultsGrid({ result }: { result: QueryResult }): React.JSX.Element {
  if (result.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Query returned 0 rows
      </div>
    )
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead className="bg-muted sticky top-0">
          <tr>
            {result.columns.map(col => (
              <th key={col} className="px-3 py-2 text-left font-medium border-b whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {result.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/50">
              {result.columns.map(col => (
                <td
                  key={col}
                  className="px-3 py-2 border-b whitespace-nowrap max-w-xs truncate"
                  title={String(row[col])}
                >
                  {row[col] === null ? (
                    <span className="text-muted-foreground italic">NULL</span>
                  ) : (
                    String(row[col])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
