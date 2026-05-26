import type { RiskLevel } from '@the-abyss/unicom-core'

import type { UnicomAgentTransport } from './transport.js'

export interface CreateUnicomAgentOptions {
  id: string
  displayName?: string
  role: string
  capabilities: string[]
  transport: UnicomAgentTransport
  createId?: () => string
  now?: () => string
}

export interface AgentActionInput {
  roomId?: string
  summary: string
  risk?: RiskLevel
  targetPaths?: string[]
  actionType?: string
}

export interface AgentEvidenceInput {
  roomId?: string
  summary: string
  command?: string
  result?: string
  filesTouched?: string[]
  verificationCommands?: string[]
}

export interface CompletionClaimInput {
  roomId?: string
  summary: string
  evidenceIds: string[]
  verificationSummary?: string
  residualRisk?: string
  scopeSummary?: string
}

export interface ApprovalRequestInput {
  roomId?: string
  title: string
  summary: string
  targetEventId?: string
}
