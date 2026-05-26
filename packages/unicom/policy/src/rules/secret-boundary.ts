import type { PolicyDecision, PolicyInput } from '../types.js'
import { extractPaths, payloadText } from '../utils.js'

const SECRET_HINTS = ['.env', 'secret', 'token', 'credential', 'api key']

export function secretBoundaryRule(input: PolicyInput): PolicyDecision | null {
  const paths = extractPaths(input.event)
  const text = payloadText(input.event)
  const touchesSecret = paths.some((path) => SECRET_HINTS.some((hint) => path.includes(hint)))
  const mentionsSecret = SECRET_HINTS.some((hint) => text.includes(hint))

  if (!touchesSecret && !mentionsSecret) {
    return null
  }

  return {
    verdict: 'require_approval',
    reason: 'Secret or environment access requires explicit approval.',
    risk: 'critical',
    matchedRule: 'secret-boundary',
  }
}
