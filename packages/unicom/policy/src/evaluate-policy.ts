import { classifyEventRisk } from '@the-abyss/unicom-core'

import { clinicalSafetyRule } from './rules/clinical-safety.js'
import { completionEvidenceRule } from './rules/completion-evidence.js'
import { crownJewelRule } from './rules/crown-jewel.js'
import { destructiveActionRule } from './rules/destructive-action.js'
import { externalApiRule } from './rules/external-api.js'
import { secretBoundaryRule } from './rules/secret-boundary.js'
import type { PolicyDecision, PolicyInput } from './types.js'
import { assertScopePaths } from './utils.js'

const RULES = [
  completionEvidenceRule,
  clinicalSafetyRule,
  crownJewelRule,
  destructiveActionRule,
  secretBoundaryRule,
  externalApiRule,
]

export function assertAllowedScope(input: PolicyInput): PolicyDecision {
  if (!input.task) {
    return {
      verdict: 'allow',
      reason: 'No task scope provided.',
      risk: classifyEventRisk(input.event),
      matchedRule: 'no-task-scope',
    }
  }

  const scope = assertScopePaths(input.task, input.event)
  if (!scope.allowed) {
    return {
      verdict: 'block',
      reason: scope.reason ?? 'Event exceeds task scope.',
      risk: 'high',
      matchedRule: 'task-scope',
    }
  }

  return {
    verdict: 'allow',
    reason: 'Event stays within declared task scope.',
    risk: classifyEventRisk(input.event),
    matchedRule: 'task-scope',
  }
}

export function evaluateUnicomPolicy(input: PolicyInput): PolicyDecision {
  const scopeDecision = assertAllowedScope(input)
  if (scopeDecision.verdict === 'block') {
    return scopeDecision
  }

  for (const rule of RULES) {
    const decision = rule(input)
    if (decision) {
      return decision
    }
  }

  return {
    verdict: 'allow',
    reason: 'No blocking or approval rule matched.',
    risk: classifyEventRisk(input.event),
    matchedRule: 'default-allow',
  }
}

export function requiresHumanApproval(
  event: PolicyInput['event'],
  task?: PolicyInput['task']
): boolean {
  return evaluateUnicomPolicy({ event, task }).verdict === 'require_approval'
}
