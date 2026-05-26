import type { PolicyDecision, PolicyInput } from '../types.js'

export function completionEvidenceRule(input: PolicyInput): PolicyDecision | null {
  if (input.event.type !== 'agent.completion_claim') {
    return null
  }

  if (input.event.evidenceIds.length > 0) {
    return null
  }

  return {
    verdict: 'block',
    reason: 'Completion claim requires at least one linked evidence id.',
    risk: 'high',
    matchedRule: 'completion-evidence',
  }
}
