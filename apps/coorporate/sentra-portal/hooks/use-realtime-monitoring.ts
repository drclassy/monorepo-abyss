'use client'

import { useCallback, useEffect, useState } from 'react'

interface MetricsData {
  timestamp: string
  railway: {
    available: boolean
    services: any[]
    deployments: any[]
    healthStatus: Record<string, 'healthy' | 'unhealthy' | 'unknown'>
  }
  sentry: {
    available: boolean
    projects: any[]
    metrics: any[]
    healthScore: number
    recentIssues: any[]
  }
  system: {
    metrics: any
    nodeProcesses: any[]
    healthScore: number
  }
  summary: {
    overallHealth: 'healthy' | 'warning' | 'error'
    activeServices: number
    totalProjects: number
    systemLoad: number
    errorRate: number
  }
}

interface UseRealtimeMonitoringOptions {
  enabled?: boolean
  interval?: number // milliseconds
  onError?: (error: Error) => void
}

export function useRealtimeMonitoring(options: UseRealtimeMonitoringOptions = {}) {
  const { enabled = true, interval = 30000, onError } = options

  const [data, setData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/metrics')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch metrics')
      }

      setData(result.data)
      setError(null)
      setLastUpdate(new Date())
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [onError])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchMetrics()
  }, [fetchMetrics])

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchMetrics()
    }
  }, [enabled, fetchMetrics])

  // Periodic updates
  useEffect(() => {
    if (!enabled || interval <= 0) return

    const intervalId = setInterval(fetchMetrics, interval)

    return () => clearInterval(intervalId)
  }, [enabled, interval, fetchMetrics])

  // Server-Sent Events for real-time updates (fallback)
  useEffect(() => {
    if (!enabled) return

    let eventSource: EventSource | null = null

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/monitoring/realtime')

        eventSource.onmessage = event => {
          try {
            const updateData = JSON.parse(event.data)
            setData(updateData)
            setLastUpdate(new Date())
            setError(null)
          } catch (err) {
            console.warn('Failed to parse SSE data:', err)
          }
        }

        eventSource.onerror = event => {
          console.warn('SSE connection error:', event)
          // Fallback to polling if SSE fails
          eventSource?.close()
          eventSource = null
        }
      } catch (err) {
        console.warn('SSE not supported, using polling only')
      }
    }

    // Connect after initial load
    if (!loading && !error) {
      connectSSE()
    }

    return () => {
      eventSource?.close()
    }
  }, [enabled, loading, error])

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    // Computed values
    overallHealth: data?.summary.overallHealth || 'unknown',
    activeServices: data?.summary.activeServices || 0,
    totalProjects: data?.summary.totalProjects || 0,
    systemLoad: data?.summary.systemLoad || 0,
    errorRate: data?.summary.errorRate || 0,
    railwayServices: data?.railway.services || [],
    sentryMetrics: data?.sentry.metrics || [],
    systemMetrics: data?.system.metrics || null,
    nodeProcesses: data?.system.nodeProcesses || [],
  }
}
