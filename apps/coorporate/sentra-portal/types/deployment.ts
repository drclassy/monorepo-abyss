/**
 * PORTAL Sentra — Deployment Types
 * Types for deployment tracking and rollback functionality
 */

// ============================================================================
// Deployment Types
// ============================================================================

export type DeploymentStatus =
  | 'pending'
  | 'building'
  | 'deploying'
  | 'success'
  | 'failed'
  | 'rolled_back'

export interface Deployment {
  id: string
  serviceId: string
  serviceName: string
  environment: 'production' | 'staging' | 'development'
  status: DeploymentStatus
  commitHash?: string
  branch?: string
  triggeredBy?: string
  triggeredAt: Date
  buildStartedAt?: Date
  buildFinishedAt?: Date
  deployStartedAt?: Date
  deployFinishedAt?: Date
  buildTime?: number // milliseconds
  deployTime?: number // milliseconds
  url?: string
  logs?: string
  error?: string
  rollbackTarget?: string // deployment ID to rollback to
  metadata: Record<string, any>
}

export interface CreateDeploymentInput {
  serviceId: string
  branch?: string
  commit?: string
  environment?: 'production' | 'staging' | 'development'
  triggeredBy?: string
}

export interface RollbackOptions {
  deploymentId: string
  targetDeploymentId: string
  reason: string
  triggeredBy?: string
}

export interface DeploymentSummary {
  total: number
  successful: number
  failed: number
  inProgress: number
  byEnvironment: Record<string, number>
  recent: Deployment[]
  averageBuildTime: number
  averageDeployTime: number
}
