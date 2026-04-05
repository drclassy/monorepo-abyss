/**
 * PORTAL Sentra — Tunnel Management Page (Client Component)
 * Enhanced with bulk operations, validation, and logs viewer
 */

'use client'

import {
  Activity,
  AlertCircle,
  CheckSquare,
  Globe,
  Loader2,
  Play,
  Plus,
  Server,
  Square,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { TunnelCard } from '@/components/tunnel-card'
import { TunnelLogsModal } from '@/components/tunnel-logs-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ApiResponse, Tunnel } from '@/types'

interface TunnelsData {
  tunnels: Tunnel[]
  activeCount: number
}

export default function TunnelsPageClient(): React.JSX.Element {
  const searchParams = useSearchParams()
  const [tunnels, setTunnels] = useState<Tunnel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'stopped' | 'error'>('all')
  const [selectedTunnels, setSelectedTunnels] = useState<Set<string>>(new Set())
  const [isBulkOperating, setIsBulkOperating] = useState(false)

  // Logs modal
  const [logsTunnel, setLogsTunnel] = useState<Tunnel | null>(null)
  const [isLogsOpen, setIsLogsOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    subdomain: string
    localPort: number
    localHost: string
    targetType: 'service' | 'project' | 'port'
    targetId: string | undefined
  }>({
    name: '',
    subdomain: '',
    localPort: 3000,
    localHost: 'localhost',
    targetType: 'port',
    targetId: undefined,
  })

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)

  // Handle query params for pre-filling
  useEffect(() => {
    const port = searchParams.get('port')
    const serviceId = searchParams.get('service')
    const projectId = searchParams.get('project')

    if (port) {
      const portNum = Number.parseInt(port, 10)
      setFormData(prev => ({
        ...prev,
        localPort: portNum,
        name: serviceId
          ? `Service-${portNum}`
          : projectId
            ? `Project-${portNum}`
            : `Tunnel-${portNum}`,
        targetType: serviceId ? 'service' : projectId ? 'project' : 'port',
        targetId: serviceId || projectId || undefined,
      }))
      setIsCreating(true)
    }
  }, [searchParams])

  // Load tunnels on mount
  useEffect(() => {
    loadTunnels()

    // Refresh every 5 seconds
    const interval = setInterval(loadTunnels, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadTunnels = async (): Promise<void> => {
    try {
      const response = await fetch('/api/tunnels')
      if (response.ok) {
        const result: ApiResponse<TunnelsData> = await response.json()
        if (result.success) {
          setTunnels(result.data.tunnels)
        }
      }
    } catch (error) {
      console.error('Failed to load tunnels:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Validate form
  const validateForm = async (): Promise<boolean> => {
    setIsValidating(true)
    setValidationErrors([])

    try {
      const response = await fetch('/api/tunnels/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain: formData.subdomain || undefined,
          localPort: formData.localPort,
          localHost: formData.localHost,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setValidationErrors(data.data.errors)
          return data.data.valid
        }
      }
      return false
    } catch (error) {
      console.error('Validation failed:', error)
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleCreateTunnel = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // Validate first
    const isValid = await validateForm()
    if (!isValid) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tunnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTunnels(prev => [data.data.tunnel, ...prev])
          setIsCreating(false)
          setFormData({
            name: '',
            subdomain: '',
            localPort: 3000,
            localHost: 'localhost',
            targetType: 'port',
            targetId: undefined,
          })
          setValidationErrors([])
        }
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create tunnel')
      }
    } catch (error) {
      alert('Failed to create tunnel')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleTunnel = async (id: string, action: 'start' | 'stop'): Promise<void> => {
    try {
      const response = await fetch(`/api/tunnels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTunnels(prev => prev.map(t => (t.id === id ? data.data.tunnel : t)))
        }
      }
    } catch (error) {
      console.error('Failed to toggle tunnel:', error)
    }
  }

  const handleDeleteTunnel = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/tunnels/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTunnels(prev => prev.filter(t => t.id !== id))
        setSelectedTunnels(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    } catch (error) {
      console.error('Failed to delete tunnel:', error)
    }
  }

  // Bulk operations
  const handleSelectAll = (checked: boolean): void => {
    if (checked) {
      setSelectedTunnels(new Set(filteredTunnels.map(t => t.id)))
    } else {
      setSelectedTunnels(new Set())
    }
  }

  const handleSelectTunnel = (id: string, checked: boolean): void => {
    setSelectedTunnels(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const handleBulkOperation = async (action: 'start' | 'stop' | 'delete'): Promise<void> => {
    if (selectedTunnels.size === 0) return

    const confirmMsg =
      action === 'delete'
        ? `Are you sure you want to delete ${selectedTunnels.size} tunnel(s)?`
        : `${action === 'start' ? 'Start' : 'Stop'} ${selectedTunnels.size} tunnel(s)?`

    if (!confirm(confirmMsg)) return

    setIsBulkOperating(true)
    try {
      const response = await fetch('/api/tunnels/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          tunnelIds: Array.from(selectedTunnels),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          if (action === 'delete') {
            setTunnels(prev => prev.filter(t => !selectedTunnels.has(t.id)))
            setSelectedTunnels(new Set())
          } else {
            // Refresh to get updated statuses
            await loadTunnels()
          }

          if (data.data.failureCount > 0) {
            alert(`${data.data.successCount} succeeded, ${data.data.failureCount} failed`)
          }
        }
      }
    } catch (error) {
      console.error('Bulk operation failed:', error)
    } finally {
      setIsBulkOperating(false)
    }
  }

  // View logs
  const handleViewLogs = (id: string): void => {
    const tunnel = tunnels.find(t => t.id === id)
    if (tunnel) {
      setLogsTunnel(tunnel)
      setIsLogsOpen(true)
    }
  }

  // Filter tunnels
  const filteredTunnels = tunnels.filter(tunnel => {
    switch (filter) {
      case 'active':
        return tunnel.status === 'active'
      case 'stopped':
        return tunnel.status === 'closed'
      case 'error':
        return tunnel.status === 'error'
      default:
        return true
    }
  })

  const activeCount = tunnels.filter(t => t.status === 'active').length
  const errorCount = tunnels.filter(t => t.status === 'error').length
  const allSelected =
    filteredTunnels.length > 0 && filteredTunnels.every(t => selectedTunnels.has(t.id))

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-500" />
            Tunnels
          </h2>
          <p className="text-muted-foreground">Expose local services to public URLs</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Tunnel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tunnels</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tunnels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${errorCount > 0 ? 'text-red-600' : ''}`}>
              {errorCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={v => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tunnels</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          {filteredTunnels.length > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={allSelected}
                onCheckedChange={checked => handleSelectAll(checked as boolean)}
              />
              Select All ({filteredTunnels.length})
            </label>
          )}
        </div>

        {selectedTunnels.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedTunnels.size} selected</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOperation('start')}
              disabled={isBulkOperating}
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkOperation('stop')}
              disabled={isBulkOperating}
            >
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkOperation('delete')}
              disabled={isBulkOperating}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTunnels(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tunnels List */}
      {filteredTunnels.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTunnels.map(tunnel => (
            <TunnelCard
              key={tunnel.id}
              tunnel={tunnel}
              selected={selectedTunnels.has(tunnel.id)}
              onSelect={handleSelectTunnel}
              onToggle={handleToggleTunnel}
              onDelete={handleDeleteTunnel}
              onViewLogs={handleViewLogs}
            />
          ))}
        </div>
      ) : (
        <Card className="h-96 flex flex-col items-center justify-center text-muted-foreground">
          <Globe className="h-12 w-12 mb-4" />
          <p className="mb-4">
            {filter === 'all' ? 'No tunnels configured' : `No ${filter} tunnels`}
          </p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tunnel
          </Button>
        </Card>
      )}

      {/* Create Tunnel Dialog */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Create New Tunnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTunnel} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tunnel Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My App Tunnel"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Local Host</label>
                    <Input
                      type="text"
                      value={formData.localHost}
                      onChange={e => setFormData(prev => ({ ...prev, localHost: e.target.value }))}
                      placeholder="localhost"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Local Port</label>
                    <Input
                      type="number"
                      value={formData.localPort}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          localPort: Number.parseInt(e.target.value),
                        }))
                      }
                      required
                      min={1}
                      max={65535}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Custom Subdomain (optional)</label>
                  <div className="flex items-center mt-1">
                    <Input
                      type="text"
                      value={formData.subdomain}
                      onChange={e => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                      placeholder="myapp"
                      className="rounded-r-none"
                    />
                    <span className="px-3 py-2 bg-muted border border-l-0 border-input rounded-r-md text-muted-foreground text-sm">
                      .loca.lt
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for random subdomain
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Target Type</label>
                  <Select
                    value={formData.targetType}
                    onValueChange={v =>
                      setFormData(prev => ({
                        ...prev,
                        targetType: v as typeof formData.targetType,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="port">Port Only</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md space-y-1">
                    {validationErrors.map((error, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setValidationErrors([])
                    }}
                    className="flex-1"
                    disabled={isSubmitting || isValidating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={validateForm}
                    className="flex-1"
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckSquare className="h-4 w-4 mr-2" />
                    )}
                    Validate
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || validationErrors.length > 0}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    Create
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs Modal */}
      <TunnelLogsModal
        tunnel={logsTunnel}
        isOpen={isLogsOpen}
        onClose={() => {
          setIsLogsOpen(false)
          setLogsTunnel(null)
        }}
      />
    </div>
  )
}
