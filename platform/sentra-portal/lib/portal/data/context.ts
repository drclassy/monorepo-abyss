import fs from 'node:fs/promises'

import { resolveRepoDataFile } from '../safe-path'
import { freshnessStatus, hoursSince } from '../status'
import type { ContextPayload, PortalResponse } from '../types'

const HANDBOOK_REL = 'docs/handbook/sentra-context-engine.html'

export async function loadContextPayload(): Promise<PortalResponse<ContextPayload>> {
  const fetchedAt = new Date().toISOString()

  try {
    const full = resolveRepoDataFile(HANDBOOK_REL)
    let modifiedAt: string | null = null
    let freshnessHours: number | null = null

    try {
      const stat = await fs.stat(full)
      modifiedAt = stat.mtime.toISOString()
      freshnessHours = Math.round(hoursSince(stat.mtimeMs) * 10) / 10
    } catch {
      modifiedAt = null
    }

    const payload: ContextPayload = {
      handbookPath: HANDBOOK_REL,
      specId: '006-context-capsule-v1',
      modifiedAt,
      freshnessHours,
      freshnessStatus: freshnessStatus(freshnessHours),
      openUrl: `file:///${full.replace(/\\/g, '/')}`,
    }

    return { ok: true, data: payload, fetchedAt }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Context load failed'
    return { ok: false, error: message, fetchedAt }
  }
}
