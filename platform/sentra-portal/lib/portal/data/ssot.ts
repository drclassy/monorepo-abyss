import fs from 'node:fs/promises'

import { parseDecisionsTail } from '../parsers/decisions'
import { parseHandoff } from '../parsers/handoff'
import { parseProgressCheckboxes } from '../parsers/progress'
import { buildSessionHeatmap } from '../parsers/sessions'
import { PROTECTED_PATHS, listAgentShapeViolations } from '../parsers/shape-guard'
import { getLatestSsotDailyReport } from '../parsers/ssot-daily'
import { resolveAgentFile } from '../safe-path'
import { freshnessStatus, hoursSince } from '../status'
import type { PortalResponse, SsotPayload } from '../types'

async function readAllowlisted(relative: string): Promise<string> {
  const full = resolveAgentFile(relative)
  const text = await fs.readFile(full, 'utf8')
  return text.slice(0, 8192)
}

export async function loadSsotPayload(): Promise<PortalResponse<SsotPayload>> {
  const fetchedAt = new Date().toISOString()

  try {
    const handoffPath = resolveAgentFile('.agent/HANDOFF.md')
    const handoffStat = await fs.stat(handoffPath)
    const handoffText = await readAllowlisted('.agent/HANDOFF.md')
    const handoff = parseHandoff(handoffText)
    const freshnessHours = hoursSince(handoffStat.mtimeMs)

    const progressText = await readAllowlisted('.agent/PROGRESS.md')
    const decisionsText = await readAllowlisted('.agent/DECISIONS.md')

    const payload: SsotPayload = {
      handoff: {
        nextAction: handoff.nextAction,
        nextActionFull: handoff.nextActionFull,
        snapshot: handoff.snapshot.slice(0, 400),
        blockers: handoff.blockers.slice(0, 8),
        freshnessHours: Math.round(freshnessHours * 10) / 10,
        freshnessStatus: freshnessStatus(freshnessHours),
        activeWork: handoff.activeWork,
        mode: handoff.mode,
        snapshotNext: handoff.snapshotNext,
        updatedAt: handoffStat.mtime.toISOString(),
      },
      progress: parseProgressCheckboxes(progressText),
      sessionHeatmap: await buildSessionHeatmap(),
      ssotDaily: await getLatestSsotDailyReport(),
      decisionsTail: parseDecisionsTail(decisionsText),
      shapeViolations: await listAgentShapeViolations(),
      protectedPaths: PROTECTED_PATHS,
    }

    return { ok: true, data: payload, fetchedAt }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SSOT load failed'
    return { ok: false, error: message, fetchedAt }
  }
}
