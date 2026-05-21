// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { QueryEvalResult, EvidenceQualityReport, Recommendation } from './types.js'

/**
 * Generates actionable recommendations based on evaluation results.
 *
 * INFO:    Informational context, no action required.
 * WARNING: Potential issue worth monitoring.
 * ACTION:  Issue requires intervention before AADI integration.
 */
export function generateRecommendations(
  queryResults: QueryEvalResult[],
  qualityReport: EvidenceQualityReport
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Overall readiness
  if (qualityReport.aadi_readiness === 'ready') {
    recommendations.push({
      type: 'INFO',
      message: `Knowledge base is AADI-ready. ${qualityReport.passed_queries}/${qualityReport.total_queries} queries passed with avg similarity ${qualityReport.avg_similarity_score}.`,
    })
  } else if (qualityReport.aadi_readiness === 'needs_review') {
    recommendations.push({
      type: 'WARNING',
      message: `Knowledge base needs review before AADI integration. ${qualityReport.passed_queries}/${qualityReport.total_queries} queries passed. ${qualityReport.readiness_reason}`,
      action: 'Review failed queries and consider expanding the knowledge corpus.',
    })
  } else {
    recommendations.push({
      type: 'ACTION',
      message: `Knowledge base is NOT ready for AADI. ${qualityReport.readiness_reason}`,
      action: 'Resolve all blocking issues before proceeding to AADI integration.',
    })
  }

  // Unapproved evidence
  if (qualityReport.flagged_evidence > 0) {
    const flaggedHashes = collectFlaggedHashes(queryResults)
    for (const hash of flaggedHashes) {
      recommendations.push({
        type: 'ACTION',
        message: `Evidence from source ${hash} was retrieved but is not approved_for_embedding in the current registry.`,
        source_hash: hash,
        action:
          'Investigate whether this document has been superseded or had its approval revoked. Re-run embed:approved to clean up stale vectors.',
      })
    }
  }

  // Untraceable evidence
  if (qualityReport.untraceable_evidence > 0) {
    recommendations.push({
      type: 'ACTION',
      message: `${qualityReport.untraceable_evidence} retrieved chunk(s) are missing required traceability fields (source_hash, document_version, page_number, or vector_id).`,
      action:
        'These chunks may have been embedded outside the ABYSS-RAG pipeline. Remove and re-embed through the approved pipeline.',
    })
  }

  // Failed queries
  if (qualityReport.failed_queries > 0) {
    recommendations.push({
      type: 'WARNING',
      message: `${qualityReport.failed_queries} query/queries failed during evaluation.`,
      action:
        'Check failed-queries.json for error details. Verify DATABASE_URL and the currently configured embedding/runtime dependencies.',
    })
  }

  // Low similarity for passing queries
  if (qualityReport.avg_similarity_score > 0 && qualityReport.avg_similarity_score < 0.6) {
    recommendations.push({
      type: 'WARNING',
      message: `Average similarity score is low (${qualityReport.avg_similarity_score}). Retrieval quality may be insufficient for clinical use.`,
      action: 'Consider expanding the knowledge corpus or re-evaluating embedding model choice.',
    })
  }

  // Queries with no approved results
  const emptyApprovalQueries = queryResults.filter(
    (r) => r.approved_results === 0 && r.results_returned > 0
  )
  if (emptyApprovalQueries.length > 0) {
    recommendations.push({
      type: 'ACTION',
      message: `${emptyApprovalQueries.length} queries returned results but none were from approved sources. Query IDs: ${emptyApprovalQueries.map((q) => q.query_id).join(', ')}.`,
      action: 'Approve relevant documents through the registry, then re-run embed:approved.',
    })
  }

  return recommendations
}

function collectFlaggedHashes(queryResults: QueryEvalResult[]): string[] {
  const hashSet = new Set<string>()
  for (const result of queryResults) {
    for (const evidence of result.evidence) {
      if (!evidence.is_approved && evidence.source_hash) {
        hashSet.add(evidence.source_hash)
      }
    }
  }
  return Array.from(hashSet)
}
