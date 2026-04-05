/**
 * PORTAL Sentra — Server Control Card
 * Component for starting/stopping local servers with real-time logs
 */

'use client'

import { AlertCircle, ExternalLink, Loader2, Play, Square, Terminal } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Project } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface ServerControlCardProps {
  project: Project
  onStatusChange?: (status: Project['status']) => void
}

interface ServerStatus {
  status: Project['status']
  pid: number | null
  url: string | null
  uptime: number | null
}

interface LogEntry {
  type: 'stdout' | 'stderr' | 'system' | 'heartbeat'
  message: string
  timestamp: Date
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

function getStatusBadgeVariant(
  status: Project['status']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'running':
      return 'default'
    case 'starting':
    case 'stopping':
      return 'secondary'
    case 'error':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusDisplayText(status: Project['status']): string {
  switch (status) {
    case 'running':
      return 'Running'
    case 'starting':
      return 'Starting...'
    case 'stopping':
      return 'Stopping...'
    case 'error':
      return 'Error'
    default:
      return 'Stopped'
  }
}

// ============================================================================
// Component
// ============================================================================

export function ServerControlCard({
  project,
  onStatusChange,
}: ServerControlCardProps): React.JSX.Element {
  const [status, setStatus] = useState<Project['status']>(project.status)
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [serverInfo, setServerInfo] = useState<ServerStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // Fetch initial status with abort controller
  useEffect(() => {
    const abortController = new AbortController()
    fetchStatus(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [project.id])

  // Setup SSE for real-time logs when running
  useEffect(() => {
    if (status === 'running' || status === 'starting') {
      connectLogStream()
    } else {
      disconnectLogStream()
    }

    return () => {
      disconnectLogStream()
    }
  }, [status, project.id])

  const fetchStatus = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      try {
        const response = await fetch(`/api/projects/${project.id}/server/status`, {
          signal,
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setServerInfo(result.data)
            setStatus(result.data.status)
          }
        }
      } catch (err) {
        // Ignore abort errors (component unmounted)
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        // Silent fail for other errors - status will be updated on next poll
      }
    },
    [project.id]
  )

  const connectLogStream = useCallback((): void => {
    if (eventSourceRef.current) return

    const eventSource = new EventSource(`/api/projects/${project.id}/logs/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data)

      if (data.type === 'init' && Array.isArray(data.logs)) {
        // Initial logs batch
        setLogs(prev => [
          ...prev,
          ...data.logs.map((log: string) => ({
            type: 'stdout' as const,
            message: log,
            timestamp: new Date(),
          })),
        ])
      } else if (data.type === 'stdout' || data.type === 'stderr' || data.type === 'system') {
        // Real-time log
        setLogs(prev => [
          ...prev,
          {
            type: data.type,
            message: data.log,
            timestamp: new Date(data.timestamp),
          },
        ])
      }
      // Ignore heartbeat
    }

    eventSource.onerror = () => {
      // Auto-reconnect will happen, or we'll clean up on unmount
    }
  }, [project.id])

  const disconnectLogStream = useCallback((): void => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  const handleStart = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${project.id}/server/start`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        setStatus('running')
        setServerInfo({
          status: 'running',
          pid: result.data.pid,
          url: result.data.url,
          uptime: 0,
        })
        onStatusChange?.('running')
      } else {
        setError(result.message || result.error || 'Failed to start server')
        setStatus('error')
        onStatusChange?.('error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start server')
      setStatus('error')
      onStatusChange?.('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${project.id}/server/stop`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        setStatus('stopping')
        onStatusChange?.('stopping')

        // Poll for actual stop
        setTimeout(async () => {
          await fetchStatus()
        }, 2000)
      } else {
        setError(result.message || result.error || 'Failed to stop server')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop server')
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = (): void => {
    setLogs([])
  }

  const isRunning = status === 'running'
  const isTransitioning = status === 'starting' || status === 'stopping'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Local Server</CardTitle>
        </div>
        <Badge variant={getStatusBadgeVariant(status)}>{getStatusDisplayText(status)}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Info */}
        {serverInfo?.url && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>PID: {serverInfo.pid}</span>
            {serverInfo.uptime !== null && <span>Uptime: {formatUptime(serverInfo.uptime)}</span>}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Control Buttons */}
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
              {status === 'starting' ? 'Starting...' : 'Start'}
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

              {serverInfo?.url && (
                <Button variant="outline" size="sm" asChild className="gap-1">
                  <a href={serverInfo.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                </Button>
              )}
            </>
          )}

          {logs.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearLogs} className="ml-auto">
              Clear
            </Button>
          )}
        </div>

        {/* Log Terminal */}
        {logs.length > 0 && (
          <div className="relative">
            <ScrollArea className="h-48 rounded-md bg-black p-3">
              <div className="font-mono text-xs space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`whitespace-pre-wrap break-all ${
                      log.type === 'stderr'
                        ? 'text-red-400'
                        : log.type === 'system'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    }`}
                  >
                    {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {logs.length === 0 && (status === 'stopped' || status === 'error') && (
          <div className="h-24 flex items-center justify-center rounded-md border border-dashed">
            <p className="text-xs text-muted-foreground">
              {status === 'error'
                ? 'Server encountered an error. Check logs above.'
                : 'Start the server to see logs'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
