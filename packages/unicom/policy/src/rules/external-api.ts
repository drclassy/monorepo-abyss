import type { PolicyDecision, PolicyInput } from '../types.js'
import { payloadText } from '../utils.js'

export function externalApiRule(input: PolicyInput): PolicyDecision | null {
  const text = payloadText(input.event)
  if (!(text.includes('http://') || text.includes('https://') || text.includes('externalaccess'))) {
    return null
  }

  return {
    verdict: 'require_approval',
    reason: 'External API access requires approval and audit visibility.',
    risk: 'high',
    matchedRule: 'external-api',
  }
}
