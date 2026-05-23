import fs from 'node:fs/promises'

import { resolveRepoDataFile } from '../safe-path'
import type { PortalResponse, PromptPayload } from '../types'

const PACKAGE_REL = 'tooling/prompt-engine/package.json'
const AUDIT_LOG_REL = '.agent/reports/portal-prompt-audits.jsonl'

interface AuditLine {
  decision?: string
  findings?: Array<{ title?: string; severity?: string }>
}

export async function loadPromptPayload(): Promise<PortalResponse<PromptPayload>> {
  const fetchedAt = new Date().toISOString()

  try {
    const pkgRaw = await fs.readFile(resolveRepoDataFile(PACKAGE_REL), 'utf8')
    const pkg = JSON.parse(pkgRaw) as { version?: string }

    const auditStats = { total: 0, ready: 0, needsWork: 0, unsafe: 0 }
    const recentFindings: PromptPayload['recentFindings'] = []

    try {
      const logRaw = await fs.readFile(resolveRepoDataFile(AUDIT_LOG_REL), 'utf8')
      const lines = logRaw.split('\n').filter(Boolean)
      auditStats.total = lines.length

      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as AuditLine
          if (entry.decision === 'ready') auditStats.ready += 1
          else if (entry.decision === 'unsafe') auditStats.unsafe += 1
          else auditStats.needsWork += 1

          for (const finding of entry.findings ?? []) {
            if (recentFindings.length >= 8) break
            recentFindings.push({
              title: finding.title ?? 'Finding',
              severity: finding.severity ?? 'medium',
              decision: entry.decision ?? 'needs_work',
            })
          }
        } catch {
          // skip malformed line
        }
      }
    } catch {
      // no audit log yet
    }

    return {
      ok: true,
      data: {
        extensionVersion: pkg.version ?? '0.0.0',
        packagePath: PACKAGE_REL,
        auditLogPath: AUDIT_LOG_REL,
        auditStats,
        recentFindings,
      },
      fetchedAt,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Prompt load failed'
    return { ok: false, error: message, fetchedAt }
  }
}
