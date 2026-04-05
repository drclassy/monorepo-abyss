/**
 * PORTAL Sentra — Monitoring Types
 * Types for health monitoring and system metrics
 */

// ============================================================================
// Health Monitoring Types
// ============================================================================

export interface ServiceHealth {
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  message: string
  latency?: number // milliseconds
  details?: Record<string, any>
}

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'error'
  timestamp: Date
  services: {
    database: ServiceHealth
    docker: ServiceHealth
    tunnels: ServiceHealth
    railway: ServiceHealth
    sentry: ServiceHealth
    system: ServiceHealth
  }
  uptime: number // seconds
  version: string
}

export interface HealthCheckResult {
  service: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  message: string
  latency: number
  timestamp: Date
  details?: any
}

// ============================================================================
// System Metrics Types
// ============================================================================

export interface SystemMetrics {
  timestamp: Date
  cpu: {
    usage: number // percentage (0-100)
    loadAverage: number[] // 1, 5, 15 minute averages
    cores: number
  }
  memory: {
    total: number // bytes
    used: number // bytes
    free: number // bytes
    usage: number // percentage (0-100)
  }
  disk: {
    total: number // bytes
    used: number // bytes
    free: number // bytes
    usage: number // percentage (0-100)
  }
  network: {
    rx: number // bytes received
    tx: number // bytes transmitted
    rxPerSecond: number // bytes/second
    txPerSecond: number // bytes/second
  }
  processes: {
    total: number
    running: number
    sleeping: number
    zombie: number
  }
}

export interface ProcessMetrics {
  pid: number
  name: string
  cpu: number // percentage
  memory: number // percentage
  status: string
  command: string
}
