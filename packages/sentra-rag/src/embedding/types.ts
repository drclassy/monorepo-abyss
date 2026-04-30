/**
 * ABYSS-RAG-004 — Approved Knowledge Embedding and Vector Store Write Pipeline
 * Core type contracts for the embedding run lifecycle.
 */

// ─── Write mode ───────────────────────────────────────────────────────────────

export type EmbeddingWriteMode = 'dry_run' | 'write'

export type EmbeddingRunStatus = 'completed' | 'completed_with_failures' | 'failed'

// ─── Skip / Failure reasons ───────────────────────────────────────────────────

export type SkipReason =
  | 'status_not_approved_for_embedding'
  | 'candidate_missing_from_registry'
  | 'missing_artifacts'
  | 'empty_chunks'
  | 'dry_run_no_write'

export type FailureStage = 'artifact_read' | 'embedding' | 'vector_write' | 'report_write'

// ─── Per-chunk record (embedded-chunks.jsonl) ─────────────────────────────────

export interface EmbeddedChunkRecord {
  source_hash: string
  document_version: string
  chunk_id: string
  vector_id: string
  page_number: number
  parser_provider: string
  ocr_confidence: number | null
  registry_status: 'approved_for_embedding'
  embedding_model: string
  embedding_dimension: number
  content_hash: string
  embedded_at: string
}

// ─── Run summary (embedding-run-summary.json) ─────────────────────────────────

export interface EmbeddingRunSummary {
  embedding_run_id: string
  started_at: string
  completed_at: string
  registry_path: string
  eligible_path: string
  total_candidates: number
  embedded_documents: number
  embedded_chunks: number
  skipped_documents: number
  failed_documents: number
  vector_store_provider: string
  embedding_provider: string
  write_mode: EmbeddingWriteMode
  status: EmbeddingRunStatus
}

// ─── Vector write report (vector-write-report.json) ───────────────────────────

export interface VectorWriteReport {
  attempted_writes: number
  successful_writes: number
  failed_writes: number
  upserted_vector_ids: string[]
  failed_vector_ids: string[]
  idempotency_key: string
}

// ─── Skipped record (skipped.json) ────────────────────────────────────────────

export interface SkippedRecord {
  source_hash: string
  reason: SkipReason
  registry_status?: string
}

// ─── Failure record (failures.json) ───────────────────────────────────────────

export interface FailureRecord {
  source_hash: string
  chunk_id?: string
  stage: FailureStage
  error_code: string
  message: string
}

// ─── Pipeline parameters ──────────────────────────────────────────────────────

export interface ApprovedEmbeddingPipelineParams {
  registryDir: string
  artifactsDir: string
  outputDir: string
  writeMode: EmbeddingWriteMode
  embeddingModel?: string
  embeddingDimensions?: number
  /** Injected database adapter. Required for write mode; ignored in dry-run. */
  databaseClient?: import('@the-abyss/vector-store').VectorStoreDatabaseClient
}
