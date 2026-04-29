// @the-abyss/vector-store - RAGOps & Vector Search

/** Vector database abstraction with similarity search and RAG pipeline support. */
export { VectorStore, createVectorStore } from './store'

/** Type contracts for documents, query results, store configuration, and embedding options. */
export type { VectorDocument, QueryResult, VectorStoreConfig, VectorStoreDatabaseClient } from './types'

/** Embedding task type hint for Vertex AI — use when constructing VectorStoreConfig. */
export type { EmbeddingTaskType, EmbeddingOptions } from './vertex-provider'

/** Low-level embedding function — use when you need raw vectors without a DB write. */
export {
  getEmbedding,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_EMBEDDING_DIMENSIONS,
  DEFAULT_GCP_LOCATION,
} from './vertex-provider'
