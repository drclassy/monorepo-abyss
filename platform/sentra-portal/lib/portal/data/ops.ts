import {
  countApps,
  countTopPackages,
  getBranch,
  getDirtyItems,
  getHeadShort,
  getMissingAgentFiles,
  summarizeDirty,
} from '../clients/git-ops'
import { countSessionLogs } from '../parsers/sessions'
import type { OpsPayload, PortalResponse } from '../types'

export async function loadOpsPayload(): Promise<PortalResponse<OpsPayload>> {
  const fetchedAt = new Date().toISOString()

  try {
    const dirtyItems = getDirtyItems()
    const groups = summarizeDirty(dirtyItems)
    const missingAgentFiles = await getMissingAgentFiles()

    const doctorNotes: string[] = []
    if (missingAgentFiles.length > 0) {
      doctorNotes.push(`Missing .agent files: ${missingAgentFiles.join(', ')}`)
    } else {
      doctorNotes.push('.agent core files: PASS')
    }

    const payload: OpsPayload = {
      branch: getBranch(),
      headShort: getHeadShort(),
      appsCount: await countApps(),
      packagesCount: await countTopPackages(),
      sessionLogs: await countSessionLogs(),
      dirtyTotal: dirtyItems.length,
      dirtyQuadrants: {
        KEEP: groups.KEEP.length,
        REVIEW: groups.REVIEW.length,
        HOLD: groups.HOLD.length,
        RISK: groups.RISK.length,
      },
      riskFiles: groups.RISK.slice(0, 25),
      missingAgentFiles,
      doctorNotes,
    }

    return { ok: true, data: payload, fetchedAt }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ops load failed'
    return { ok: false, error: message, fetchedAt }
  }
}
