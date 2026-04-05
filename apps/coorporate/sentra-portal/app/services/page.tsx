/**
 * PORTAL Sentra — Services Management Page
 * Manage Docker-based development services
 */

'use client'

import { Activity, AlertCircle, Database, Loader2, Server } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { ServiceCard } from '@/components/service-card'
import { ServiceCatalog } from '@/components/service-catalog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiResponse, ServiceDefinition, ServiceInstance } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface ServicesData {
  services: ServiceInstance[]
  catalog: ServiceDefinition[]
  dockerAvailable: boolean
}

// ============================================================================
// Component
// ============================================================================

export default function ServicesPage(): React.JSX.Element {
  const [data, setData] = useState<ServicesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'running' | 'catalog'>('running')

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/services')
      const result: ApiResponse<ServicesData> = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Failed to fetch services')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Calculate stats
  const stats = {
    total: data?.services.length || 0,
    running: data?.services.filter(s => s.status === 'running').length || 0,
    databases:
      data?.services.filter(s => {
        const def = data?.catalog.find(c => c.id === s.definitionId)
        return def?.type === 'database' && s.status === 'running'
      }).length || 0,
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)] bg-surface-page">
        <Loader2 className="h-8 w-8 animate-spin text-sentra-text-muted" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-surface-page min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-sentra-text-primary tracking-tight">
            Services
          </h2>
          <p className="text-sentra-text-muted mt-1 text-sm">
            One-click databases, caches, and development tools
          </p>
        </div>
        {!data?.dockerAvailable && (
          <Badge variant="destructive" className="gap-1 bg-red-900/50 text-red-400 border-red-800">
            <AlertCircle className="h-3 w-3" />
            Docker Not Available
          </Badge>
        )}
      </div>

      {/* Docker Warning */}
      {!data?.dockerAvailable && (
        <div className="p-4 rounded-lg bg-surface-secondary border border-red-900/50 text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Docker is not available</span>
          </div>
          <p className="mt-1 text-sm text-sentra-text-secondary">
            Please install Docker to use services.{' '}
            <a
              href="https://docs.docker.com/get-docker/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-sentra-text-primary"
            >
              Get Docker
            </a>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">
              Total Services
            </CardTitle>
            <Server className="h-4 w-4 text-sentra-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sentra-text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">
              Running
            </CardTitle>
            <Activity className="h-4 w-4 text-sentra-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sentra-text-primary">{stats.running}</div>
          </CardContent>
        </Card>
        <Card className="bg-surface-secondary border-sentra-border-medium shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sentra-text-secondary">
              Databases
            </CardTitle>
            <Database className="h-4 w-4 text-sentra-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sentra-text-primary">{stats.databases}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sentra-border-medium">
        <button
          onClick={() => setActiveTab('running')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'running'
              ? 'border-sentra-border-strong text-sentra-text-primary'
              : 'border-transparent text-sentra-text-muted hover:text-sentra-text-secondary'
          }`}
        >
          Running Services ({data?.services.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-sentra-border-strong text-sentra-text-primary'
              : 'border-transparent text-sentra-text-muted hover:text-sentra-text-secondary'
          }`}
        >
          Add Service
        </button>
      </div>

      {/* Content */}
      {activeTab === 'running' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.services.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              definition={data?.catalog.find(c => c.id === service.definitionId) || null}
              onStatusChange={fetchData}
            />
          ))}
          {data?.services.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-64 border-2 border-dashed border-sentra-border-medium rounded-lg bg-surface-secondary">
              <Server className="h-12 w-12 text-sentra-text-muted mb-4" />
              <p className="text-sentra-text-muted mb-4">No services running</p>
              <Button
                onClick={() => setActiveTab('catalog')}
                className="bg-surface-tertiary hover:bg-surface-hover text-sentra-text-primary"
              >
                Add Your First Service
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ServiceCatalog
          catalog={data?.catalog || []}
          onServiceCreated={() => {
            fetchData()
            setActiveTab('running')
          }}
          disabled={!data?.dockerAvailable}
        />
      )}
    </div>
  )
}
