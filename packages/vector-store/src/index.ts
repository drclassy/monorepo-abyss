// @the-abyss/vector-store - RAGOps & Vector Search

/** Vector database abstraction with similarity search and RAG pipeline support. */
export { VectorStore, createVectorStore } from './store'

/** Type contracts for documents, query results, store configuration, and embedding options. */
export type { VectorDocument, QueryResult, VectorStoreConfig } from './types'

/** Embedding task type hint for Vertex AI — use when constructing VectorStoreConfig. */
export type { EmbeddingTaskType } from './vertex-provider'
