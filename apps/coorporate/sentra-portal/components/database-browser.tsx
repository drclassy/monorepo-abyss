/**
 * PORTAL Sentra — Database Browser Component
 * Browse tables, view schema, and explore data
 */

'use client'

import {
  ChevronDown,
  ChevronRight,
  Columns,
  Database,
  Download,
  Eye,
  Key,
  Loader2,
  RefreshCw,
  Search,
  Table,
} from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ColumnInfo, IndexInfo, TableInfo } from '@/types/database'

// ============================================================================
// Types
// ============================================================================

interface DatabaseBrowserProps {
  connectionId: string
  onTableSelect?: (tableName: string) => void
  onQueryTable?: (tableName: string) => void
}

interface TableSchema {
  columns: ColumnInfo[]
  indexes: IndexInfo[]
}

// ============================================================================
// Component
// ============================================================================

export function DatabaseBrowser({
  connectionId,
  onTableSelect,
  onQueryTable,
}: DatabaseBrowserProps): React.JSX.Element {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [schema, setSchema] = useState<TableSchema | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)
  const [tableData, setTableData] = useState<{
    rows: Record<string, unknown>[]
    columns: string[]
    totalCount: number
  } | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Load tables on mount
  useEffect(() => {
    loadTables()
  }, [connectionId])

  const loadTables = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/database/schema?connectionId=${connectionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTables(data.data.tables)
        }
      }
    } catch (error) {
      console.error('Failed to load tables:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectTable = async (tableName: string): Promise<void> => {
    setSelectedTable(tableName)
    onTableSelect?.(tableName)

    // Load schema
    setIsLoadingSchema(true)
    try {
      const response = await fetch(
        `/api/database/schema?connectionId=${connectionId}&table=${encodeURIComponent(tableName)}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSchema({
            columns: data.data.columns,
            indexes: data.data.indexes,
          })
        }
      }
    } catch (error) {
      console.error('Failed to load schema:', error)
    } finally {
      setIsLoadingSchema(false)
    }

    // Load data preview
    setIsLoadingData(true)
    try {
      const response = await fetch(
        `/api/database/data?connectionId=${connectionId}&table=${encodeURIComponent(tableName)}&limit=50`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTableData({
            rows: data.data.result.rows,
            columns: data.data.result.columns,
            totalCount: data.data.result.rowCount,
          })
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json' | 'sql'): Promise<void> => {
    if (!selectedTable) return

    try {
      const response = await fetch('/api/database/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          tableName: selectedTable,
          format,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Download file
          const blob = new Blob([data.data.data], { type: data.data.mimeType })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = data.data.filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Tables List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Tables ({tables.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadTables}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {tables.map(table => (
              <button
                key={table.name}
                onClick={() => selectTable(table.name)}
                className={`w-full text-left px-4 py-3 hover:bg-accent flex items-center justify-between group ${
                  selectedTable === table.name ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Table className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{table.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {table.rowCount?.toLocaleString()} rows • {table.size}
                    </div>
                  </div>
                </div>
                {selectedTable === table.name && <ChevronRight className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Details */}
      <Card className="lg:col-span-2">
        {selectedTable ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{selectedTable}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onQueryTable?.(selectedTable)}>
                    <Search className="h-4 w-4 mr-1" />
                    Query
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="data">
                <TabsList>
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="indexes">Indexes</TabsTrigger>
                </TabsList>

                <TabsContent value="data" className="mt-4">
                  {isLoadingData ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : tableData ? (
                    <div className="overflow-auto max-h-[400px]">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            {tableData.columns.map(col => (
                              <th
                                key={col}
                                className="px-3 py-2 text-left font-medium whitespace-nowrap"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {tableData.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-muted/50">
                              {tableData.columns.map(col => (
                                <td
                                  key={col}
                                  className="px-3 py-2 whitespace-nowrap max-w-xs truncate"
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
                      {tableData.totalCount > 50 && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          Showing 50 of {tableData.totalCount.toLocaleString()} rows
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">No data available</div>
                  )}
                </TabsContent>

                <TabsContent value="structure" className="mt-4">
                  {isLoadingSchema ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : schema ? (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left">Column</th>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2 text-left">Nullable</th>
                            <th className="px-3 py-2 text-left">Default</th>
                            <th className="px-3 py-2 text-left">Key</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {schema.columns.map(col => (
                            <tr key={col.name} className="hover:bg-muted/50">
                              <td className="px-3 py-2 font-medium">{col.name}</td>
                              <td className="px-3 py-2 text-muted-foreground">{col.type}</td>
                              <td className="px-3 py-2">
                                {col.nullable ? (
                                  <span className="text-muted-foreground">Yes</span>
                                ) : (
                                  <span className="text-red-500">No</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {col.defaultValue || '-'}
                              </td>
                              <td className="px-3 py-2">
                                {col.isPrimaryKey && (
                                  <Badge variant="default" className="text-xs">
                                    PK
                                  </Badge>
                                )}
                                {col.isForeignKey && (
                                  <Badge variant="secondary" className="text-xs ml-1">
                                    FK
                                  </Badge>
                                )}
                                {col.isUnique && !col.isPrimaryKey && (
                                  <Badge variant="outline" className="text-xs ml-1">
                                    UQ
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No schema information available
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="indexes" className="mt-4">
                  {schema?.indexes ? (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left">Name</th>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2 text-left">Columns</th>
                            <th className="px-3 py-2 text-left">Unique</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {schema.indexes.map(idx => (
                            <tr key={idx.name} className="hover:bg-muted/50">
                              <td className="px-3 py-2 font-medium">{idx.name}</td>
                              <td className="px-3 py-2">
                                <Badge variant="outline" className="text-xs">
                                  {idx.type}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">{idx.columns.join(', ')}</td>
                              <td className="px-3 py-2">{idx.isUnique ? 'Yes' : 'No'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No index information available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <Database className="h-12 w-12 mb-4" />
            <p>Select a table to view details</p>
          </div>
        )}
      </Card>
    </div>
  )
}
