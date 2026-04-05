/**
 * PORTAL Sentra — Tunnel Logs Modal
 * Display real-time logs from localtunnel
 */

'use client'

import { Download, Loader2, Terminal, Trash2, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Tunnel } from '@/types/tunnel'

// ============================================================================
// Props
// ============================================================================

interface TunnelLogsModalProps {
  tunnel: Tunnel | null
  isOpen: boolean
  onClose: () => void
}

// ============================================================================
// Component
// ============================================================================

export function TunnelLogsModal({
  tunnel,
  isOpen,
  onClose,
}: TunnelLogsModalProps): React.JSX.Element {
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Load logs
  const loadLogs = async (): Promise<void> => {
    if (!tunnel) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tunnels/${tunnel.id}/logs`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLogs(data.data.logs)
        }
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and polling
  useEffect(() => {
    if (isOpen && tunnel) {
      loadLogs()

      // Poll every 2 seconds
      const interval = setInterval(loadLogs, 2000)
      return () => clearInterval(interval)
    }
  }, [isOpen, tunnel?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  // Handle scroll to toggle auto-scroll
  const handleScroll = (): void => {
    if (!scrollContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setAutoScroll(isAtBottom)
  }

  const handleClear = (): void => {
    setLogs([])
  }

  const handleDownload = (): void => {
    if (!tunnel || logs.length === 0) return

    const content = logs.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tunnel-${tunnel.name}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!tunnel) return <></>

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-muted-foreground" />
              <DialogTitle>Tunnel Logs: {tunnel.name}</DialogTitle>
              <Badge variant={tunnel.status === 'active' ? 'default' : 'secondary'}>
                {tunnel.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={logs.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={logs.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{logs.length} log entries</span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={e => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 bg-black rounded-lg p-4 overflow-auto font-mono text-sm min-h-[400px] max-h-[500px]"
        >
          {isLoading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No logs available
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => {
                // Parse log line to extract timestamp and content
                const match = log.match(/^\[([^\]]+)\]\s*(.*)$/)
                const timestamp = match ? match[1] : ''
                const content = match ? match[2] : log
                const isError =
                  content.toLowerCase().includes('error') ||
                  content.toLowerCase().includes('failed')

                return (
                  <div key={index} className="break-all">
                    {timestamp && (
                      <span className="text-gray-500 mr-2">
                        {new Date(timestamp).toLocaleTimeString()}
                      </span>
                    )}
                    <span className={isError ? 'text-red-400' : 'text-gray-300'}>{content}</span>
                  </div>
                )
              })}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
