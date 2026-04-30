// @the-abyss/vector-store - RAGOps & Vector Search

/** Vector database abstraction with similarity search and RAG pipeline support. */
export { VectorStore, createVectorStore } from './store'

/** Type contracts for documents, query results, store configuration, and embedding options. */
export type { VectorDocument, QueryResult, VectorStoreConfig, VectorStoreDatabaseClient } from './types'

/** Embedding options for local Ollama — use when constructing VectorStoreConfig. */
export type { EmbeddingOptions } from './embedding-provider'

/** Low-level embedding function — use when you need raw vectors without a DB write. */
export {
  getEmbedding,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_EMBEDDING_DIMENSIONS,
} from './embedding-provider'
