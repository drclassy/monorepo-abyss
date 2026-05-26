import type { PolicyDecision, PolicyInput } from '../types.js'
import { extractPaths } from '../utils.js'

export function crownJewelRule(input: PolicyInput): PolicyDecision | null {
  const matches = extractPaths(input.event).some((path) => path.startsWith('packages/sentra/'))
  if (!matches) {
    return null
  }

  return {
    verdict: 'require_approval',
    reason: 'Event targets crown-jewel Sentra path.',
    risk: 'critical',
    matchedRule: 'crown-jewel',
  }
}
