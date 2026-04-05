/**
 * PORTAL Sentra — Database Management Page (Client Component)
 */

'use client'

import { Activity, Database, Loader2, Plus, Server, Trash2 } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { DatabaseBrowser } from '@/components/database-browser'
import { SQLEditor } from '@/components/sql-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ApiResponse, DatabaseConnection, QueryResult, TableInfo } from '@/types'

interface ConnectionsData {
  connections: DatabaseConnection[]
}

export default function DatabasePageClient(): React.JSX.Element {
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [activeConnection, setActiveConnection] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [activeTab, setActiveTab] = useState<'query' | 'browser'>('query')

  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql' as const,
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
    ssl: false,
  })

  useEffect(() => {
    loadConnections()
  }, [])

  useEffect(() => {
    if (activeConnection) {
      loadTables(activeConnection)
    }
  }, [activeConnection])

  const loadConnections = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/database/connections')
      if (response.ok) {
        const result: ApiResponse<ConnectionsData> = await response.json()
        if (result.success) {
          setConnections(result.data.connections)
          if (result.data.connections.length > 0 && !activeConnection) {
            setActiveConnection(result.data.connections[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTables = async (connectionId: string): Promise<void> => {
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
    }
  }

  const handleCreateConnection = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const testResponse = await fetch('/api/database/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const testResult = await testResponse.json()
      if (!testResult.success || !testResult.data.success) {
        alert(testResult.data?.message || 'Connection test failed')
        setIsCreating(false)
        return
      }

      const response = await fetch('/api/database/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConnections(prev => [data.data.connection, ...prev])
          setActiveConnection(data.data.connection.id)
          setFormData({
            name: '',
            type: 'postgresql',
            host: 'localhost',
            port: 5432,
            database: '',
            username: '',
            password: '',
            ssl: false,
          })
        }
      }
    } catch (error) {
      alert('Failed to create connection')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteConnection = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this connection?')) return

    try {
      const response = await fetch(`/api/database/connections/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConnections(prev => prev.filter(c => c.id !== id))
        if (activeConnection === id) {
          setActiveConnection(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete connection:', error)
    }
  }

  const handleExecuteQuery = async (query: string): Promise<QueryResult> => {
    if (!activeConnection) throw new Error('No connection selected')

    const response = await fetch('/api/database/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connectionId: activeConnection,
        query,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Query failed')
    }

    const data = await response.json()
    return data.data.result
  }

  const activeConn = connections.find(c => c.id === activeConnection)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Database</h2>
          <p className="text-muted-foreground">SQL editor and database management</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Connection
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeConnection ? 1 : 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tables.length}</div>
          </CardContent>
        </Card>
      </div>

      {connections.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Connections:</span>
          {connections.map(conn => (
            <button
              key={conn.id}
              onClick={() => setActiveConnection(conn.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeConnection === conn.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card hover:bg-accent'
              }`}
            >
              <Database className="h-3 w-3" />
              {conn.name}
              <span className="text-xs opacity-70">({conn.type})</span>
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleDeleteConnection(conn.id)
                }}
                className="ml-1 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      )}

      {activeConn ? (
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'query' | 'browser')}>
          <TabsList>
            <TabsTrigger value="query">SQL Query</TabsTrigger>
            <TabsTrigger value="browser">Database Browser</TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="mt-4">
            <div className="h-[600px]">
              <SQLEditor
                connectionId={activeConn.id}
                tables={tables}
                onExecute={handleExecuteQuery}
              />
            </div>
          </TabsContent>

          <TabsContent value="browser" className="mt-4">
            <div className="h-[600px]">
              <DatabaseBrowser
                connectionId={activeConn.id}
                onQueryTable={table => {
                  setActiveTab('query')
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="h-96 flex flex-col items-center justify-center text-muted-foreground">
          <Database className="h-12 w-12 mb-4" />
          <p className="mb-4">No database connections</p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Connection
          </Button>
        </Card>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>New Database Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateConnection} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Connection Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="My PostgreSQL"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Database Type</label>
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        type: e.target.value as typeof formData.type,
                        port:
                          e.target.value === 'postgresql'
                            ? 5432
                            : e.target.value === 'mysql'
                              ? 3306
                              : e.target.value === 'mongodb'
                                ? 27017
                                : e.target.value === 'redis'
                                  ? 6379
                                  : 5432,
                      }))
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                    <option value="redis">Redis</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Host</label>
                    <input
                      type="text"
                      value={formData.host}
                      onChange={e => setFormData(prev => ({ ...prev, host: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Port</label>
                    <input
                      type="number"
                      value={formData.port}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, port: Number.parseInt(e.target.value) }))
                      }
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Database</label>
                  <input
                    type="text"
                    value={formData.database}
                    onChange={e => setFormData(prev => ({ ...prev, database: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ssl"
                    checked={formData.ssl}
                    onChange={e => setFormData(prev => ({ ...prev, ssl: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="ssl" className="text-sm">
                    Use SSL
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Test & Connect
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
