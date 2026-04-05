/**
 * PORTAL Sentra — Tunnel Plugin Types
 * Localtunnel integration for exposing local services
 */

// ============================================================================
// Tunnel Types
// ============================================================================

export type TunnelStatus = 'creating' | 'active' | 'error' | 'closed'

export type TunnelTargetType = 'service' | 'project' | 'port'

export interface Tunnel {
  id: string
  name: string
  status: TunnelStatus
  subdomain?: string
  publicUrl: string
  localPort: number
  localHost: string
  targetType: TunnelTargetType
  targetId?: string // serviceId or projectId
  createdAt: Date
  startedAt?: Date
  stoppedAt?: Date
  errorMessage?: string
  metadata?: {
    requestCount?: number
    lastActivity?: Date
    tunnelPid?: number
    restartAttempts?: number
  }
}

// ============================================================================
// Tunnel Operations
// ============================================================================

export interface CreateTunnelInput {
  name?: string
  subdomain?: string // Custom subdomain (optional)
  localPort: number
  localHost?: string // default: localhost
  targetType: TunnelTargetType
  targetId?: string // Link to service or project
}

export interface TunnelHealth {
  status: TunnelStatus
  latency?: number
  publicUrl?: string
  error?: string
}

// ============================================================================
// Localtunnel Events
// ============================================================================

export interface TunnelEvent {
  type: 'created' | 'started' | 'error' | 'closed'
  tunnelId: string
  timestamp: Date
  data?: Record<string, unknown>
}

// ============================================================================
// API Response Types
// ============================================================================

export interface TunnelListResponse {
  tunnels: Tunnel[]
  activeCount: number
}

export interface TunnelCreateResponse {
  tunnel: Tunnel
  publicUrl: string
}
