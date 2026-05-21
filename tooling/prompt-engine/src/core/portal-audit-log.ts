import * as fs from 'node:fs'
import * as path from 'node:path'

import type { AuditResult } from './audit.js'

export interface PortalAuditLogEntry {
  at: string
  decision: AuditResult['decision']
  totalScore: number
  activeFilePath?: string
  findings: Array<{ title: string; severity: string }>
}

const _rootCache = new Map<string, string | null>()

export function findMonorepoRoot(startPath?: string): string | null {
  if (!startPath) return null

  const resolvedDir = path.dirname(path.resolve(startPath))
  const cached = _rootCache.get(resolvedDir)
  if (cached !== undefined) return cached

  let dir = resolvedDir

  for (let i = 0; i < 14; i += 1) {
    const hasWorkspace = fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))
    const hasAgents = fs.existsSync(path.join(dir, 'AGENTS.md'))
    if (hasWorkspace && hasAgents) {
      _rootCache.set(resolvedDir, dir)
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  _rootCache.set(resolvedDir, null)
  return null
}

export function appendPortalAuditLog(
  repoRoot: string,
  result: AuditResult,
  activeFilePath?: string
): void {
  const entry: PortalAuditLogEntry = {
    at: new Date().toISOString(),
    decision: result.decision,
    totalScore: result.totalScore,
    activeFilePath,
    findings: result.findings.slice(0, 8).map((f) => ({
      title: f.title,
      severity: f.severity,
    })),
  }

  const logPath = path.join(repoRoot, '.agent', 'reports', 'portal-prompt-audits.jsonl')
  fs.mkdirSync(path.dirname(logPath), { recursive: true })
  // NOTE: appendFileSync is not atomic under concurrent VS Code windows.
  // Acceptable for best-effort audit log; caller wraps in try/catch.
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`, 'utf8')
}
