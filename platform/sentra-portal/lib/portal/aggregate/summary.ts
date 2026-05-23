import fs from 'node:fs/promises'

import { fetchUnicomHealth } from '../clients/unicom'
import { readVerifyStatus } from '../clients/verify-cache'
import { loadContextPayload } from '../data/context'
import { loadOpsPayload } from '../data/ops'
import { loadPromptPayload } from '../data/prompt'
import { loadRagPayload } from '../data/rag'
import { loadSsotPayload } from '../data/ssot'
import { parseLatestDecision } from '../parsers/decisions'
import { getRepoRoot } from '../repo-root'
import { resolveAgentFile } from '../safe-path'
import { truncate } from '../status'
import type { PortalResponse, StripSummary } from '../types'

export async function loadStripSummary(): Promise<PortalResponse<StripSummary>> {
  const fetchedAt = new Date().toISOString()

  const [ssot, ops, unicom, rag, verify, context, prompt] = await Promise.all([
    loadSsotPayload(),
    loadOpsPayload(),
    fetchUnicomHealth(),
    loadRagPayload(),
    readVerifyStatus(),
    loadContextPayload(),
    loadPromptPayload(),
  ])

  let latestDecision = ''
  try {
    const decisionsText = await fs.readFile(resolveAgentFile('.agent/DECISIONS.md'), 'utf8')
    latestDecision = parseLatestDecision(decisionsText)
  } catch {
    latestDecision = ''
  }

  const evalPassPct =
    rag.data?.latestEval && rag.data.latestEval.totalQueries > 0
      ? Math.round((rag.data.latestEval.passedQueries / rag.data.latestEval.totalQueries) * 100)
      : null

  const summary: StripSummary = {
    ssotFreshnessHours: ssot.data?.handoff.freshnessHours ?? null,
    ssotStatus: ssot.data?.handoff.freshnessStatus ?? 'unknown',
    nextAction: truncate(
      ssot.data?.handoff.nextAction ||
        ssot.data?.handoff.snapshotNext ||
        ssot.error ||
        'HANDOFF unavailable',
      320
    ),
    unicomAgents: unicom.agents,
    unicomStatus: unicom.hubStatus,
    dirtyRisk: ops.data?.dirtyQuadrants.RISK ?? 0,
    ragReadiness: rag.data?.latestEval?.aadiReadiness ?? 'no_eval',
    verifyStatus: verify?.overall ?? 'unknown',
    branch: ops.data?.branch ?? '—',
    headShort: ops.data?.headShort ?? '—',
    progressDone: ssot.data?.progress.done ?? 0,
    progressTotal: ssot.data?.progress.total ?? 0,
    dirtyTotal: ops.data?.dirtyTotal ?? 0,
    dirtyKeep: ops.data?.dirtyQuadrants.KEEP ?? 0,
    dirtyReview: ops.data?.dirtyQuadrants.REVIEW ?? 0,
    dirtyHold: ops.data?.dirtyQuadrants.HOLD ?? 0,
    contextFreshnessHours: context.data?.freshnessHours ?? null,
    contextStatus: context.data?.freshnessStatus ?? 'unknown',
    promptReady: prompt.data?.auditStats.ready ?? 0,
    promptTotal: prompt.data?.auditStats.total ?? 0,
    ragApproved: rag.data?.registryApproved ?? 0,
    ragTotal: rag.data?.registryTotal ?? 0,
    sessionLogs: ops.data?.sessionLogs ?? 0,
    verifyBuild: verify?.build ?? 'unknown',
    verifyTypecheck: verify?.typecheck ?? 'unknown',
    verifyTest: verify?.test ?? 'unknown',
    appsCount: ops.data?.appsCount ?? 0,
    packagesCount: ops.data?.packagesCount ?? 0,
    ragPending: rag.data?.registryPending ?? 0,
    promptNeedsWork: prompt.data?.auditStats.needsWork ?? 0,
    promptUnsafe: prompt.data?.auditStats.unsafe ?? 0,
    unicomSseConnected: unicom.sseConnected,
    blockerCount: ssot.data?.handoff.blockers.length ?? 0,
    repoRoot: getRepoRoot(),
    fetchedSources: {
      ssot: ssot.ok,
      ops: ops.ok,
      rag: rag.ok,
      context: context.ok,
      prompt: prompt.ok,
      verify: verify != null,
      unicom: unicom.hubStatus !== 'unknown' || unicom.status !== 'offline',
    },
    activeWork: ssot.data?.handoff.activeWork ?? '',
    snapshotNext: ssot.data?.handoff.snapshotNext ?? '',
    latestDecision,
    evalPassPct,
    topRiskFiles: ops.data?.riskFiles.slice(0, 3).map((item) => item.file) ?? [],
    handoffUpdated: ssot.data?.handoff.updatedAt ?? null,
    ssotDailyTitle: ssot.data?.ssotDaily?.filename ?? null,
  }

  const warnings: string[] = []
  if (!ssot.ok && ssot.error) warnings.push(`SSOT: ${ssot.error}`)
  if (!ops.ok && ops.error) warnings.push(`Ops: ${ops.error}`)
  if (!rag.ok && rag.error) warnings.push(`RAG: ${rag.error}`)

  return {
    ok: ssot.ok || ops.ok,
    data: summary,
    error: warnings.length > 0 ? warnings.join(' · ') : undefined,
    fetchedAt,
  }
}
