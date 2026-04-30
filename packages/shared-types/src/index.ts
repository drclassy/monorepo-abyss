// ============================================
// SHARED TYPES FOR THE ABYSS MONOREPO
// ============================================

export * from './symphony'
export * from './platform-api'

/** User identity, roles, and session types — used across all authentication flows. */
// User & Authentication
export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: Role
}

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

export interface Session {
  id: string
  userId: string
  expiresAt: Date
  createdAt: Date
}

/** Organization and app configuration types. */
// Organization & Apps
export interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  settings: Record<string, unknown>
}

export interface App {
  id: string
  name: string
  description: string | null
  organizationId: string
  config: Record<string, unknown>
  active: boolean
}

/** AI session types — lifecycle, status, and performance metrics for agent executions. */
// AI Sessions
export interface AiSession {
  id: string
  appId: string
  agentName: string
  flowId: string | null
  flowVersion: string | null
  handoffUrl: string | null
  status: AiSessionStatus
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  logs: string | null
  metrics: AiSessionMetrics | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

export type AiSessionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface AiSessionMetrics {
  latency: number
  tokenUsage: {
    prompt: number
    completion: number
    total: number
  }
  model: string
  confidence: number
}

/** Immutable audit log entry — records every significant action with actor and resource context. */
// Audit Logs
export interface AuditLog {
  id: string
  organizationId: string | null
  aiSessionId: string | null
  action: string
  resource: string
  resourceId: string | null
  userId: string | null
  userEmail: string | null
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown>
  createdAt: Date
}

/** Flow definition and execution types — contracts for the Langflow-based AI orchestration layer. */
// Flow Definitions
export interface FlowDefinition {
  id: string
  name: string
  version: string
  flowId: string
  description: string | null
  jsonPath: string
  isActive: boolean
  metadata: FlowMetadata | null
  createdAt: Date
  updatedAt: Date
}

export interface FlowMetadata {
  models: string[]
  inputs: string[]
  outputs: string[]
}

export interface FlowExecution {
  id: string
  flowDefId: string
  status: FlowExecutionStatus
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  latency: number | null
  errorMessage: string | null
  createdAt: Date
}

export type FlowExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SHADOW'

/** API key type as stored in the database — distinct from `ApiKeyConfig` in iskandar-gatekeeper which is the runtime form. */
// API Keys
export interface ApiKey {
  id: string
  name: string
  key: string
  appId: string
  permissions: string[]
  expiresAt: Date | null
  lastUsedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Standard API envelope types — all HTTP responses should be wrapped in `ApiResponse`. */
// Common Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: Record<string, unknown>
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/** Pagination request params and paginated response wrapper for list endpoints. */
// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/** Agent handoff and session approval types — used by iskandar-gatekeeper GO-Gate and session management. */
// Handoff & Sessions
export interface Handoff {
  id: string
  title: string
  status: HandoffStatus
  agent: string
  date: string
  phase: string
  approval?: HandoffApproval
}

export type HandoffStatus = 'PENDING' | 'GO' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export interface HandoffApproval {
  approved: boolean
  approvedBy: string
  approvedAt: string
  comments?: string
}

/** JET workflow configuration — governs GO-Gate, handoff, and session traceability behavior. */
// Classy Workflow
export interface ClassyWorkflowConfig {
  handoffRequired: boolean
  goGateEnabled: boolean
  traceabilityEnforced: boolean
  sessionLogPath: string
}
