import type { RiskLevel, UnicomEvent, UnicomTask } from '@the-abyss/unicom-core'

export type PolicyVerdict = 'allow' | 'require_approval' | 'block'

export interface PolicyDecision {
  verdict: PolicyVerdict
  reason: string
  risk: RiskLevel
  matchedRule: string
}

export interface PolicyInput {
  event: UnicomEvent
  task?: UnicomTask
}
