import type { PolicyDecision, PolicyInput } from '../types.js'
import { extractPaths, payloadText } from '../utils.js'

export function clinicalSafetyRule(input: PolicyInput): PolicyDecision | null {
  const text = payloadText(input.event)
  const touchesClinicalPath = extractPaths(input.event).some((path) =>
    path.startsWith('packages/clinical/')
  )
  const clinicalHint = text.includes('clinical') || text.includes('diagnosis')
  const finalDiagnosisClaim =
    text.includes('finaldiagnosisclaim') || text.includes('final diagnosis')

  if (finalDiagnosisClaim) {
    return {
      verdict: 'block',
      reason: 'Agent may not issue a final diagnosis claim.',
      risk: 'critical',
      matchedRule: 'clinical-final-diagnosis',
    }
  }

  if (!touchesClinicalPath && !clinicalHint) {
    return null
  }

  return {
    verdict: 'require_approval',
    reason: 'Clinical or diagnosis-related work requires explicit human review.',
    risk: 'critical',
    matchedRule: 'clinical-safety',
  }
}
