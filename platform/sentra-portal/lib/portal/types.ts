export type PortalStatus = 'ok' | 'warn' | 'critical' | 'unknown'

export interface PortalResponse<T> {
  ok: boolean
  data?: T
  error?: string
  fetchedAt: string
}

export interface StripSummary {
  ssotFreshnessHours: number | null
  ssotStatus: PortalStatus
  nextAction: string
  unicomAgents: number
  unicomStatus: PortalStatus
  dirtyRisk: number
  ragReadiness: string
  verifyStatus: PortalStatus
  branch: string
  headShort: string
  progressDone: number
  progressTotal: number
  dirtyTotal: number
  dirtyKeep: number
  dirtyReview: number
  dirtyHold: number
  contextFreshnessHours: number | null
  contextStatus: PortalStatus
  promptReady: number
  promptTotal: number
  ragApproved: number
  ragTotal: number
  sessionLogs: number
  verifyBuild: PortalStatus
  verifyTypecheck: PortalStatus
  verifyTest: PortalStatus
  appsCount: number
  packagesCount: number
  ragPending: number
  promptNeedsWork: number
  promptUnsafe: number
  unicomSseConnected: number
  blockerCount: number
  repoRoot: string
  fetchedSources: Record<string, boolean>
  activeWork: string
  snapshotNext: string
  latestDecision: string
  evalPassPct: number | null
  topRiskFiles: string[]
  handoffUpdated: string | null
  ssotDailyTitle: string | null
}

export type DirtyCategory = 'KEEP' | 'REVIEW' | 'HOLD' | 'RISK'

export interface DirtyItem {
  status: string
  file: string
  category: DirtyCategory
}

export interface OpsPayload {
  branch: string
  headShort: string
  appsCount: number
  packagesCount: number
  sessionLogs: number
  dirtyTotal: number
  dirtyQuadrants: Record<DirtyCategory, number>
  riskFiles: DirtyItem[]
  missingAgentFiles: string[]
  doctorNotes: string[]
}

export interface VerifyStatusFile {
  at: string
  build: PortalStatus
  typecheck: PortalStatus
  test: PortalStatus
  overall: PortalStatus
}

export interface RagPayload {
  registryTotal: number
  registryApproved: number
  registryPending: number
  latestEval: {
    runId: string
    status: string
    aadiReadiness: string
    passedQueries: number
    totalQueries: number
    avgSimilarity: number
    completedAt: string
    writeMode: string
  } | null
  quality: {
    approvalRate: number
    traceabilityCompleteness: number
    readinessReason: string
  } | null
  evalRunsDir: string
  phaseNotes: string[]
}

export interface UnicomAgentView {
  id: string
  displayName: string
  status: string
  lastSeenAgoSec: number
  capabilities: string[]
  sseConnected?: boolean
  inboxDepth?: number
}

export interface UnicomFeedEntry {
  id: string
  from: string
  to: string
  timestamp: number
  type: string
}

export interface UnicomPayload {
  health: { status: string; agents: number; hubStatus: PortalStatus }
  agents: UnicomAgentView[]
  baseUrl: string
  deliveryMode: 'sse' | 'poll' | 'unknown'
  sseConnected: string[]
  inboxDepths: Record<string, number>
  recentFeed: UnicomFeedEntry[]
}

export interface ContextPayload {
  handbookPath: string
  specId: string
  modifiedAt: string | null
  freshnessHours: number | null
  freshnessStatus: PortalStatus
  openUrl: string
}

export interface PromptPayload {
  extensionVersion: string
  packagePath: string
  auditLogPath: string
  auditStats: {
    total: number
    ready: number
    needsWork: number
    unsafe: number
  }
  recentFindings: Array<{ title: string; severity: string; decision: string }>
}

export interface SsotPayload {
  handoff: {
    nextAction: string
    nextActionFull: string
    snapshot: string
    blockers: string[]
    freshnessHours: number | null
    freshnessStatus: PortalStatus
    activeWork: string
    mode: string
    snapshotNext: string
    updatedAt: string | null
  }
  progress: { done: number; total: number }
  sessionHeatmap: { date: string; count: number }[]
  ssotDaily: {
    filename: string
    modifiedAt: string
    excerpt: string
  } | null
  decisionsTail: string[]
  shapeViolations: string[]
  protectedPaths: string[]
}
