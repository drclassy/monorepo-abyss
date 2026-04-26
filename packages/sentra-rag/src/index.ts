export { SentraRAGEngine } from './engine.js'
export { PgVectorStore } from './storage/pgvector.store.js'
export { OllamaEmbedder } from './ingestion/embedder.js'
export { LocalBrainEngine } from './retrieval/local.engine.js'
export { HybridBrainEngine } from './retrieval/hybrid.engine.js'
export { ingestFile, ingestLibrary } from './ingestion/pipeline.js'
export { chunkText } from './ingestion/chunker.js'
export { GemmaEngine } from './assessment/gemma.js'
export { GuardEngine } from './compliance/guard.js'
export type {
  MedicalChunk,
  MedicalCategory,
  RAGQueryResult,
  RetrievedChunk,
  IngestionResult,
  SentraRAGConfig,
} from './types.js'

export { runPdfDryRunIngestion } from './ingestion/pdf-batch-runner.js'
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

