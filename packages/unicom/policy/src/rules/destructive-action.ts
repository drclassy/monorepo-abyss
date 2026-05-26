import type { PolicyDecision, PolicyInput } from '../types.js'
import { extractPaths, payloadText } from '../utils.js'

const DESTRUCTIVE_HINTS = ['delete', 'remove', 'reset', 'clean', 'force-push', 'drop']
const GOVERNANCE_PREFIXES = ['.agent/', 'apps/_governance/', 'packages/unicom/policy/']
const GOVERNANCE_ROOT_FILES = [
  'AGENTS.md',
  '.gitignore',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'turbo.json',
  'package.json',
]

function normalizePath(path: string): string {
  return path
    .replaceAll('\\', '/')
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '')
}

export function destructiveActionRule(input: PolicyInput): PolicyDecision | null {
  const text = payloadText(input.event)
  const actionLooksDestructive = DESTRUCTIVE_HINTS.some((hint) => text.includes(hint))
  const touchesGovernance = extractPaths(input.event).some((path) => {
    const normalized = normalizePath(path)
    return (
      GOVERNANCE_ROOT_FILES.includes(normalized) ||
      GOVERNANCE_PREFIXES.some((prefix) => normalized.startsWith(prefix))
    )
  })

  if (actionLooksDestructive) {
    return {
      verdict: 'require_approval',
      reason: 'Destructive action requires explicit approval.',
      risk: 'high',
      matchedRule: 'destructive-action',
    }
  }

  if (touchesGovernance) {
    return {
      verdict: 'require_approval',
      reason: 'Governance or policy path requires explicit approval.',
      risk: 'high',
      matchedRule: 'governance-policy-change',
    }
  }

  return null
}
