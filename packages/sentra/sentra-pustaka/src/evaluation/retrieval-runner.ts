// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { VectorStore } from '@sentra/cermin'
import type { KnowledgeSourceRegistryEntry } from '../registry/registry-types.js'
import type { EvalQuery, QueryEvalResult } from './types.js'
import { validateEvidence, buildRegistryMap } from './evidence-validator.js'

const DEFAULT_TOP_K = 5
const DEFAULT_MIN_SIMILARITY = 0.5

/**
 * Executes a single evaluation query against the vector store and validates results.
 *
 * Rules:
 * - No full query text or chunk content is logged.
 * - Every result is validated for traceability and approval.
 * - Errors are recorded without stopping the full batch.
 */
export async function runEvalQuery(
  query: EvalQuery,
  vectorStore: VectorStore,
  registryEntries: KnowledgeSourceRegistryEntry[],
  defaultTopK = DEFAULT_TOP_K,
  defaultMinSimilarity = DEFAULT_MIN_SIMILARITY,
): Promise<QueryEvalResult> {
  const topK = query.top_k ?? defaultTopK
  const minSimilarity = query.min_similarity ?? defaultMinSimilarity
  const evaluatedAt = new Date().toISOString()
  const registryMap = buildRegistryMap(registryEntries)

  // Truncate query text for safe logging (first 60 chars only)
  const queryTextPrefix = query.query_text.slice(0, 60) + (query.query_text.length > 60 ? '…' : '')

  const errors: string[] = []

  let rawResults
  try {
    rawResults = await vectorStore.query(query.query_text, topK)
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200)
    errors.push(`VECTOR_QUERY_FAILED: ${msg}`)
    return {
      query_id: query.query_id,
      query_text_prefix: queryTextPrefix,
      top_k_requested: topK,
      results_returned: 0,
      approved_results: 0,
      flagged_results: 0,
      untraceable_results: 0,
      avg_similarity: 0,
      max_similarity: 0,
      min_similarity: 0,
      passed_threshold: false,
      evidence: [],
      errors,
      evaluated_at: evaluatedAt,
    }
  }

  // Validate each result
  const evidence = rawResults.map((r) => validateEvidence(r, registryMap))

  const approvedResults = evidence.filter((e) => e.is_approved).length
  const flaggedResults = evidence.filter((e) => !e.is_approved && e.is_traceable).length
  const untraceableResults = evidence.filter((e) => !e.is_traceable).length

  const similarities = evidence.map((e) => e.similarity_score)
  const avgSimilarity =
    similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0
  const maxSimilarity = similarities.length > 0 ? Math.max(...similarities) : 0
  const minSimilarityVal = similarities.length > 0 ? Math.min(...similarities) : 0

  const passedThreshold =
    approvedResults > 0 && evidence.some((e) => e.is_approved && e.similarity_score >= minSimilarity)

  return {
    query_id: query.query_id,
    query_text_prefix: queryTextPrefix,
    top_k_requested: topK,
    results_returned: evidence.length,
    approved_results: approvedResults,
    flagged_results: flaggedResults,
    untraceable_results: untraceableResults,
    avg_similarity: Math.round(avgSimilarity * 1000) / 1000,
    max_similarity: Math.round(maxSimilarity * 1000) / 1000,
    min_similarity: Math.round(minSimilarityVal * 1000) / 1000,
    passed_threshold: passedThreshold,
    evidence,
    errors,
    evaluated_at: evaluatedAt,
  }
}
