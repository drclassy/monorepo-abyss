/**
 * PORTAL Sentra — Service Card Component
 * Displays and controls a running service
 */

'use client'

import {
  Database,
  ExternalLink,
  Globe,
  Key,
  Loader2,
  Mail,
  MessageSquare,
  Play,
  Square,
  Trash2,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ServiceDefinition, ServiceInstance } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface ServiceCardProps {
  service: ServiceInstance
  definition: ServiceDefinition | null
  onStatusChange?: () => void
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<string, React.ElementType> = {
  Database,
  Zap,
  Mail,
  MessageSquare,
  Leaf: Database, // Fallback
}

// ============================================================================
// Component
// ============================================================================

export function ServiceCard({
  service,
  definition,
  onStatusChange,
}: ServiceCardProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)

  const handleStart = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/services/${service.id}/start`, { method: 'POST' })
      if (response.ok) {
        onStatusChange?.()
      }
    } catch (error) {
      console.error('Failed to start service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/services/${service.id}/stop`, { method: 'POST' })
      if (response.ok) {
        onStatusChange?.()
      }
    } catch (error) {
      console.error('Failed to stop service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${service.name}"? This will remove all data.`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/services/${service.id}`, { method: 'DELETE' })
      if (response.ok) {
        onStatusChange?.()
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: ServiceInstance['status']) => {
    switch (status) {
      case 'running':
        return 'default'
      case 'creating':
      case 'stopping':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const Icon = definition ? iconMap[definition.icon] || Database : Database
  const isRunning = service.status === 'running'
  const isTransitioning = service.status === 'creating' || service.status === 'stopping'

  // Get admin UI URL if available
  const adminUrl = definition?.ui?.adminPort
    ? `http://localhost:${definition.ui.adminPort}${definition.ui.adminPath || ''}`
    : null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{service.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {definition?.name || service.definitionId}
              </p>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(service.status)}>{service.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Info */}
        <div className="space-y-2 text-sm">
          {Object.entries(service.ports).map(([containerPort, hostPort]) => (
            <div key={containerPort} className="flex justify-between items-center">
              <span className="text-muted-foreground">Port {containerPort}:</span>
              <code className="bg-muted px-2 py-0.5 rounded text-xs">localhost:{hostPort}</code>
            </div>
          ))}
        </div>

        {/* Credentials (if available) */}
        {definition?.credentials && Object.keys(definition.credentials).length > 0 && (
          <div className="rounded-md bg-muted p-3">
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Key className="h-3 w-3" />
              {showCredentials ? 'Hide Credentials' : 'Show Credentials'}
            </button>

            {showCredentials && (
              <div className="mt-2 space-y-1 text-xs">
                {service.env.POSTGRES_USER && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username:</span>
                    <code>{service.env.POSTGRES_USER}</code>
                  </div>
                )}
                {service.env.POSTGRES_PASSWORD && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Password:</span>
                    <code className="max-w-[150px] truncate" title={service.env.POSTGRES_PASSWORD}>
                      {service.env.POSTGRES_PASSWORD}
                    </code>
                  </div>
                )}
                {service.env.POSTGRES_DB && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Database:</span>
                    <code>{service.env.POSTGRES_DB}</code>
                  </div>
                )}
                {service.env.MYSQL_ROOT_PASSWORD && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Root Password:</span>
                    <code
                      className="max-w-[150px] truncate"
                      title={service.env.MYSQL_ROOT_PASSWORD}
                    >
                      {service.env.MYSQL_ROOT_PASSWORD}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={isLoading || isTransitioning}
              size="sm"
              className="gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start
            </Button>
          ) : (
            <>
              <Button
                onClick={handleStop}
                disabled={isLoading}
                variant="destructive"
                size="sm"
                className="gap-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Stop
              </Button>

              {adminUrl && (
                <Button variant="outline" size="sm" asChild className="gap-1">
                  <a href={adminUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Admin
                  </a>
                </Button>
              )}

              {/* Create Tunnel Button */}
              <Button variant="outline" size="sm" asChild className="gap-1">
                <Link
                  href={`/tunnels?port=${Object.values(service.ports)[0]}&service=${service.id}`}
                >
                  <Globe className="h-4 w-4" />
                  Tunnel
                </Link>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="ml-auto text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
