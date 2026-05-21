// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
/**
 * ABYSS-RAG-005 — Retrieval Validation & Evidence Quality Evaluation Pipeline
 * Core type contracts for the retrieval evaluation lifecycle.
 */
import type { VectorStoreDatabaseClient } from '@sentra/cermin'

// ─── Write mode ───────────────────────────────────────────────────────────────

export type EvalWriteMode = 'dry_run' | 'eval'

export type EvalRunStatus = 'completed' | 'completed_with_failures' | 'failed'

export type AadiReadiness = 'ready' | 'needs_review' | 'not_ready'

export type RecommendationType = 'INFO' | 'WARNING' | 'ACTION'

// ─── Query input ──────────────────────────────────────────────────────────────

export interface EvalQuery {
  query_id: string
  query_text: string
  top_k?: number
  min_similarity?: number
  expected_topics?: string[]
}

// ─── Per-result evidence record ───────────────────────────────────────────────

export interface EvidenceRecord {
  vector_id: string
  source_hash: string | null
  document_version: string | null
  page_number: number | null
  parser_provider: string | null
  ocr_confidence: number | null
  registry_status_at_write: string | null
  current_registry_status: string | null
  similarity_score: number
  is_traceable: boolean
  is_approved: boolean
  traceability_issues: string[]
}

// ─── Per-query result (query-results.jsonl) ───────────────────────────────────

export interface QueryEvalResult {
  query_id: string
  query_text_prefix: string
  top_k_requested: number
  results_returned: number
  approved_results: number
  flagged_results: number
  untraceable_results: number
  avg_similarity: number
  max_similarity: number
  min_similarity: number
  passed_threshold: boolean
  evidence: EvidenceRecord[]
  errors: string[]
  evaluated_at: string
}

// ─── Evidence quality report ──────────────────────────────────────────────────

export interface EvidenceQualityReport {
  total_queries: number
  total_results: number
  approved_evidence: number
  flagged_evidence: number
  untraceable_evidence: number
  passed_queries: number
  failed_queries: number
  avg_similarity_score: number
  min_similarity_score: number
  max_similarity_score: number
  traceability_completeness: number
  approval_rate: number
  aadi_readiness: AadiReadiness
  readiness_reason: string
}

// ─── Run summary (retrieval-eval-summary.json) ────────────────────────────────

export interface RetrievalEvalSummary {
  retrieval_eval_run_id: string
  started_at: string
  completed_at: string
  registry_path: string
  embedding_artifacts_path: string
  queries_path: string
  total_queries: number
  passed_queries: number
  failed_queries: number
  avg_similarity: number
  aadi_readiness: AadiReadiness
  write_mode: EvalWriteMode
  status: EvalRunStatus
}

// ─── Failed query record ──────────────────────────────────────────────────────

export interface FailedQuery {
  query_id: string
  error_code: string
  message: string
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export interface Recommendation {
  type: RecommendationType
  message: string
  source_hash?: string
  action?: string
}

// ─── Pipeline parameters ──────────────────────────────────────────────────────

export interface RetrievalEvalPipelineParams {
  registryDir: string
  embeddingArtifactsDir: string
  queriesPath: string
  outputDir: string
  writeMode: EvalWriteMode
  topK?: number
  minSimilarity?: number
  embeddingModel?: string
  /** Injected database adapter. Required for eval mode; ignored in dry-run. */
  databaseClient?: VectorStoreDatabaseClient
}
