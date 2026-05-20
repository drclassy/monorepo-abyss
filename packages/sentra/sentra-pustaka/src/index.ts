// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
export { SentraRAGEngine } from './engine.js'
export { PgVectorStore } from './storage/pgvector.store.js'
export { OllamaEmbedder } from './ingestion/embedder.js'
export { LocalBrainEngine } from './retrieval/local.engine.js'
export { HybridBrainEngine } from './retrieval/hybrid.engine.js'
export { ingestFile, ingestLibrary } from './ingestion/pipeline.js'
export { chunkText } from './ingestion/chunker.js'
export { formatGroundedCitations } from './citation/formatter.js'
export { attachGroundedCitations } from './citation/query-result.js'
export { GemmaEngine } from './assessment/gemma.js'
export { GuardEngine } from './compliance/guard.js'
export type {
  MedicalChunk,
  MedicalCategory,
  CitationSource,
  CitedEvidenceChunk,
  GroundedCitation,
  RetrievedChunkCitationMetadata,
  RAGQueryResult,
  RetrievedChunk,
  IngestionResult,
  SentraRAGConfig,
} from './types.js'

export { runPdfDryRunIngestion } from './ingestion/pdf-batch-runner.js'
export { ingestHarvestedLiterature } from './ingestion/literature-connector.js'
export type {
  DryRunDocumentStatus,
  DryRunDocumentResult,
  IngestionSummary,
} from './ingestion/dry-run-types.js'

export { updateKnowledgeRegistry } from './registry/knowledge-registry.js'
export { readKnowledgeRegistry } from './registry/registry-reader.js'
export { writeKnowledgeRegistry } from './registry/registry-writer.js'
export { markSuperseded } from './registry/supersession.js'
export { createEligibleForEmbeddingExport } from './registry/eligibility-exporter.js'
export { buildRegistrySummary } from './registry/registry-summary.js'
export { mapQualityToRegistryStatus } from './registry/registry-types.js'
export type {
  KnowledgeSourceStatus,
  KnowledgeSourceRegistryEntry,
  KnowledgeRegistry,
  RegistrySummary,
  QualityStatus,
} from './registry/registry-types.js'

export { runRetrievalEvalPipeline } from './evaluation/eval-pipeline.js'
export { loadEvalQueries, createSampleQueriesFile } from './evaluation/query-loader.js'
export { validateEvidence, buildRegistryMap } from './evaluation/evidence-validator.js'
export { scoreEvidenceQuality } from './evaluation/quality-scorer.js'
export { generateRecommendations } from './evaluation/recommendations.js'
export type {
  EvalQuery,
  EvalWriteMode,
  EvalRunStatus,
  AadiReadiness,
  EvidenceRecord,
  QueryEvalResult,
  EvidenceQualityReport,
  RetrievalEvalSummary,
  FailedQuery,
  Recommendation,
  RetrievalEvalPipelineParams,
} from './evaluation/types.js'

export { runApprovedEmbeddingPipeline } from './embedding/approved-embedding.pipeline.js'
export { loadApprovedCandidates } from './embedding/registry-gate.js'
export { buildVectorId, buildChunkId, buildContentHash } from './embedding/vector-id.js'
export { PgPoolVectorAdapter } from './embedding/pg-adapter.js'
export { buildPdfKnowledgeDatabaseRecord } from './knowledge/pdf-knowledge-record.js'
export type {
  PdfKnowledgeChunk,
  PdfKnowledgeDatabaseRecord,
  BuildPdfKnowledgeDatabaseRecordParams,
} from './knowledge/pdf-knowledge-record.js'
export type {
  EmbeddingWriteMode,
  EmbeddingRunStatus,
  EmbeddingRunSummary,
  EmbeddedChunkRecord,
  VectorWriteReport,
  SkippedRecord,
  FailureRecord,
  ApprovedEmbeddingPipelineParams,
} from './embedding/types.js'
