// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
// @sentra/cermin - RAGOps & Vector Search

/** Vector database abstraction with similarity search and RAG pipeline support. */
export { VectorStore, createVectorStore } from './store'

/** Type contracts for documents, query results, store configuration, and embedding options. */
export type {
  VectorDocument,
  QueryResult,
  VectorStoreConfig,
  VectorStoreDatabaseClient,
  PreEmbeddedRecord,
} from './types'

/** Thrown when Ollama embedding fails too many times consecutively. */
export { EmbeddingCircuitOpenError } from './types'

/** Grounded citation consumption helpers for RAG evidence views. */
export { createCitationEvidenceViews } from './citations'
export type { ConsumableGroundedCitation, CitationEvidenceView } from './citations'

/** Low-level embedding function — use when you need raw vectors without a DB write. */
export {
  getEmbedding,
  getEmbeddingBatch,
  getEmbeddingWithRetry,
  createCircuitBreaker,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_EMBEDDING_DIMENSIONS,
} from './embedding-provider'
export type { EmbeddingOptions, CircuitBreaker, RetryOptions } from './embedding-provider'
export { OpenAISearchBackend } from './openai-search-backend'
export type { SearchBackend } from './openai-search-backend'
