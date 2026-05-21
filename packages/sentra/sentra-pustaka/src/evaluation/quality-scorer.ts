// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type {
  QueryEvalResult,
  EvidenceQualityReport,
  AadiReadiness,
} from './types.js'

/**
 * Aggregates evidence quality metrics across all query evaluation results.
 */
export function scoreEvidenceQuality(
  queryResults: QueryEvalResult[],
  failedQueryCount: number,
): EvidenceQualityReport {
  if (queryResults.length === 0 && failedQueryCount === 0) {
    return {
      total_queries: 0,
      total_results: 0,
      approved_evidence: 0,
      flagged_evidence: 0,
      untraceable_evidence: 0,
      passed_queries: 0,
      failed_queries: failedQueryCount,
      avg_similarity_score: 0,
      min_similarity_score: 0,
      max_similarity_score: 0,
      traceability_completeness: 1,
      approval_rate: 1,
      aadi_readiness: 'not_ready',
      readiness_reason: 'No queries evaluated',
    }
  }

  const totalQueries = queryResults.length + failedQueryCount
  const passedQueries = queryResults.filter((r) => r.passed_threshold).length

  const allEvidence = queryResults.flatMap((r) => r.evidence)
  const totalResults = allEvidence.length
  const approvedEvidence = allEvidence.filter((e) => e.is_approved).length
  const flaggedEvidence = allEvidence.filter((e) => !e.is_approved && e.is_traceable).length
  const untraceableEvidence = allEvidence.filter((e) => !e.is_traceable).length

  const similarities = allEvidence.map((e) => e.similarity_score).filter((s) => s > 0)
  const avgSimilarity =
    similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0
  const minSimilarity = similarities.length > 0 ? Math.min(...similarities) : 0
  const maxSimilarity = similarities.length > 0 ? Math.max(...similarities) : 0

  const traceabilityCompleteness =
    totalResults > 0 ? (totalResults - untraceableEvidence) / totalResults : 1

  const approvalRate = totalResults > 0 ? approvedEvidence / totalResults : 0

  const passRate = totalQueries > 0 ? passedQueries / totalQueries : 0

  const { aadi_readiness, readiness_reason } = determineAadiReadiness({
    passRate,
    approvalRate,
    traceabilityCompleteness,
    avgSimilarity,
    totalQueries,
    passedQueries,
    failedQueryCount,
  })

  return {
    total_queries: totalQueries,
    total_results: totalResults,
    approved_evidence: approvedEvidence,
    flagged_evidence: flaggedEvidence,
    untraceable_evidence: untraceableEvidence,
    passed_queries: passedQueries,
    failed_queries: failedQueryCount,
    avg_similarity_score: Math.round(avgSimilarity * 1000) / 1000,
    min_similarity_score: Math.round(minSimilarity * 1000) / 1000,
    max_similarity_score: Math.round(maxSimilarity * 1000) / 1000,
    traceability_completeness: Math.round(traceabilityCompleteness * 1000) / 1000,
    approval_rate: Math.round(approvalRate * 1000) / 1000,
    aadi_readiness,
    readiness_reason,
  }
}

interface ReadinessInput {
  passRate: number
  approvalRate: number
  traceabilityCompleteness: number
  avgSimilarity: number
  totalQueries: number
  passedQueries: number
  failedQueryCount: number
}

/**
 * Determines AADI readiness verdict based on evidence quality metrics.
 *
 * ready:        ≥80% queries pass, 100% approval rate, 100% traceability
 * needs_review: 50-79% queries pass OR borderline metrics
 * not_ready:    <50% queries pass OR unapproved/untraceable evidence present
 */
function determineAadiReadiness(input: ReadinessInput): {
  aadi_readiness: AadiReadiness
  readiness_reason: string
} {
  const { passRate, approvalRate, traceabilityCompleteness, avgSimilarity, totalQueries } = input

  if (totalQueries === 0) {
    return { aadi_readiness: 'not_ready', readiness_reason: 'No queries evaluated' }
  }

  if (approvalRate < 1.0) {
    return {
      aadi_readiness: 'not_ready',
      readiness_reason: `Unapproved evidence present (approval_rate=${approvalRate.toFixed(2)}). All retrieved evidence must come from approved_for_embedding sources.`,
    }
  }

  if (traceabilityCompleteness < 1.0) {
    return {
      aadi_readiness: 'not_ready',
      readiness_reason: `Untraceable evidence present (traceability=${traceabilityCompleteness.toFixed(2)}). All chunks must have source_hash, document_version, page_number, and vector_id.`,
    }
  }

  if (passRate >= 0.8 && avgSimilarity >= 0.6) {
    return {
      aadi_readiness: 'ready',
      readiness_reason: `${Math.round(passRate * 100)}% queries passed with avg similarity ${avgSimilarity.toFixed(2)}. All evidence is approved and traceable.`,
    }
  }

  if (passRate >= 0.5) {
    return {
      aadi_readiness: 'needs_review',
      readiness_reason: `${Math.round(passRate * 100)}% queries passed (threshold: 80%). Review low-similarity queries or expand knowledge corpus.`,
    }
  }

  return {
    aadi_readiness: 'not_ready',
    readiness_reason: `Only ${Math.round(passRate * 100)}% queries passed (threshold: 80%). Knowledge corpus insufficient or similarity scores too low.`,
  }
}
