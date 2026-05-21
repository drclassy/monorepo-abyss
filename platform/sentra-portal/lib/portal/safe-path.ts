import path from 'node:path'

import { getRepoRoot } from './repo-root'

const ALLOWED_RELATIVE = [
  '.agent/README.md',
  '.agent/HANDOFF.md',
  '.agent/PROGRESS.md',
  '.agent/DECISIONS.md',
  'docs/handbook/sentra-context-engine.html',
]

export function getAgentDir(): string {
  return path.join(getRepoRoot(), '.agent')
}

export function getAgentSessionsDir(): string {
  return path.join(getAgentDir(), 'sessions')
}

export function getSsotDailyDir(): string {
  return path.join(getAgentDir(), 'reports', 'ssot-daily')
}

const REPO_DATA_PREFIXES = [
  'packages/sentra/sentra-pustaka/data/',
  'tooling/prompt-engine/package.json',
  'docs/handbook/sentra-context-engine.html',
  '.agent/reports/portal-verify-status.json',
  '.agent/reports/portal-prompt-audits.jsonl',
]

export function resolveRepoDataFile(relative: string): string {
  const normalized = relative.replace(/\\/g, '/')
  if (normalized.includes('..')) {
    throw new Error('Path traversal rejected')
  }
  const allowed = REPO_DATA_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(prefix)
  )
  if (!allowed) {
    throw new Error(`Path not allowlisted: ${relative}`)
  }
  const full = path.resolve(getRepoRoot(), normalized)
  const root = path.resolve(getRepoRoot())
  if (!full.startsWith(root + path.sep) && full !== root) {
    throw new Error('Path outside repo')
  }
  return full
}

export function resolveAgentFile(relative: string): string {
  const normalized = relative.replace(/\\/g, '/')
  if (normalized.includes('..')) {
    throw new Error('Path traversal rejected')
  }

  const allowed =
    ALLOWED_RELATIVE.includes(normalized) ||
    /^\.agent\/sessions\/[\w-]+\.md$/.test(normalized) ||
    /^\.agent\/reports\/ssot-daily\/[\w-]+\.md$/.test(normalized)

  if (!allowed) {
    throw new Error(`Path not allowlisted: ${relative}`)
  }

  const full = path.resolve(getRepoRoot(), normalized)
  const root = path.resolve(getRepoRoot())
  if (!full.startsWith(root + path.sep) && full !== root) {
    throw new Error('Path outside repo')
  }

  return full
}
