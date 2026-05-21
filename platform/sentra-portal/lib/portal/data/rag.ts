import { loadRagMetrics } from '../clients/rag-eval'
import type { PortalResponse, RagPayload } from '../types'

export async function loadRagPayload(): Promise<PortalResponse<RagPayload>> {
  const fetchedAt = new Date().toISOString()

  try {
    const metrics = await loadRagMetrics()

    const payload: RagPayload = {
      registryTotal: metrics.registryTotal,
      registryApproved: metrics.registryApproved,
      registryPending: metrics.registryPending,
      latestEval: metrics.latestEval
        ? {
            runId: metrics.latestEval.retrieval_eval_run_id,
            status: metrics.latestEval.status,
            aadiReadiness: metrics.latestEval.aadi_readiness,
            passedQueries: metrics.latestEval.passed_queries,
            totalQueries: metrics.latestEval.total_queries,
            avgSimilarity: metrics.latestEval.avg_similarity,
            completedAt: metrics.latestEval.completed_at,
            writeMode: metrics.latestEval.write_mode,
          }
        : null,
      quality: metrics.quality
        ? {
            approvalRate: metrics.quality.approval_rate,
            traceabilityCompleteness: metrics.quality.traceability_completeness,
            readinessReason: metrics.quality.readiness_reason,
          }
        : null,
      evalRunsDir: metrics.evalRunsDir,
      phaseNotes: metrics.phaseNotes,
    }

    return { ok: true, data: payload, fetchedAt }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'RAG load failed'
    return { ok: false, error: message, fetchedAt }
  }
}
