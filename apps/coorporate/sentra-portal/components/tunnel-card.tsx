/**
 * PORTAL Sentra — Tunnel Card Component
 * Displays tunnel status with controls
 */

'use client'

import {
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Power,
  RefreshCw,
  Server,
  Terminal,
  Trash2,
} from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { Tunnel } from '@/types/tunnel'

// ============================================================================
// Props
// ============================================================================

interface TunnelCardProps {
  tunnel: Tunnel
  selected?: boolean
  onSelect?: (id: string, selected: boolean) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string, action: 'start' | 'stop') => void
  onViewLogs?: (id: string) => void
}

// ============================================================================
// Component
// ============================================================================

export function TunnelCard({
  tunnel,
  selected = false,
  onSelect,
  onDelete,
  onToggle,
  onViewLogs,
}: TunnelCardProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    if (!tunnel.publicUrl) return

    try {
      await navigator.clipboard.writeText(tunnel.publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleToggle = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const action = tunnel.status === 'active' ? 'stop' : 'start'
      await onToggle?.(tunnel.id, action)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!confirm('Are you sure you want to delete this tunnel?')) return

    setIsLoading(true)
    try {
      await onDelete?.(tunnel.id)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (): React.ReactNode => {
    switch (tunnel.status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'creating':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Creating...
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case 'closed':
        return (
          <Badge variant="outline">
            <Power className="h-3 w-3 mr-1" />
            Stopped
          </Badge>
        )
      default:
        return <Badge variant="outline">{tunnel.status}</Badge>
    }
  }

  const restartAttempts = tunnel.metadata?.restartAttempts || 0

  return (
    <Card
      className={`relative overflow-hidden transition-all ${selected ? 'ring-2 ring-primary' : ''}`}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={checked => onSelect(tunnel.id, checked as boolean)}
          />
        </div>
      )}

      <CardHeader className={`pb-3 ${onSelect ? 'pl-10' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                tunnel.status === 'active'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{tunnel.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
                <span className="text-xs text-muted-foreground">
                  {tunnel.targetType === 'service'
                    ? 'Service'
                    : tunnel.targetType === 'project'
                      ? 'Project'
                      : 'Port'}
                </span>
                {restartAttempts > 0 && (
                  <Badge variant="outline" className="text-xs text-orange-500">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {restartAttempts} restart{restartAttempts > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* View Logs Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewLogs?.(tunnel.id)}
              title="View Logs"
            >
              <Terminal className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              disabled={isLoading || tunnel.status === 'creating'}
              title={tunnel.status === 'active' ? 'Stop' : 'Start'}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : tunnel.status === 'active' ? (
                <Power className="h-4 w-4 text-red-500" />
              ) : (
                <Power className="h-4 w-4 text-green-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Public URL */}
        {tunnel.publicUrl && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-3">
            <Globe className="h-4 w-4 text-green-500 flex-shrink-0" />
            <a
              href={tunnel.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm font-mono text-blue-600 hover:underline truncate"
            >
              {tunnel.publicUrl}
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleCopy}
              title="Copy URL"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              asChild
              title="Open in new tab"
            >
              <a href={tunnel.publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}

        {/* Local Target */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Server className="h-4 w-4" />
          <span>
            {tunnel.localHost}:{tunnel.localPort}
          </span>
          {tunnel.subdomain && (
            <>
              <span className="mx-1">•</span>
              <span>Subdomain: {tunnel.subdomain}</span>
            </>
          )}
        </div>

        {/* Error Message */}
        {tunnel.errorMessage && (
          <div className="mt-3 p-2 bg-red-50 text-red-600 text-sm rounded">
            {tunnel.errorMessage}
          </div>
        )}

        {/* Metadata */}
        {tunnel.metadata?.requestCount !== undefined && (
          <div className="mt-3 text-xs text-muted-foreground">
            Requests: {tunnel.metadata.requestCount.toLocaleString()}
            {tunnel.metadata.lastActivity && (
              <>
                {' • Last activity: '}
                {new Date(tunnel.metadata.lastActivity).toLocaleString()}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
