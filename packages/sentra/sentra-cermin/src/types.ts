// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
// ─── Storage layer ────────────────────────────────────────────────────────────

/**
 * Full record shape as stored in the KnowledgeBase table.
 * The `embedding` field is the raw float array (not exposed via Prisma).
 */
export interface VectorDocument {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// ─── Query results ────────────────────────────────────────────────────────────

/**
 * Returned by VectorStore.query().
 * `score` is cosine similarity in [0, 1] — higher is more relevant.
 */
export interface QueryResult {
  id: string
  content: string
  score: number
  metadata: Record<string, unknown>
}

// ─── Database boundary ────────────────────────────────────────────────────────

/**
 * Minimal Prisma-compatible database surface required by VectorStore.
 *
 * Caller-owned apps inject their own Prisma client. This package must not import
 * a concrete app/platform database because healthcare apps have independent DBs.
 */
export interface VectorStoreDatabaseClient {
  $executeRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>
}

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * Configuration for VectorStore.
 *
 * Implementation: caller-owned pgvector store + local Ollama embeddings.
 */
export interface VectorStoreConfig {
  /**
   * Prisma-compatible database client owned by the caller app.
   */
  database?: VectorStoreDatabaseClient

  /**
   * Embedding model to use via Ollama.
   * @default 'nomic-embed-text'
   */
  embeddingModel?: string

  /**
   * Expected output dimension of the embedding model.
   * Must match the `vector(N)` declaration in the KnowledgeBase Prisma schema.
   * @default 768  (correct for text-embedding-004)
   */
  embeddingDimensions?: number

  /**
   * Ollama base URL.
   * @default 'http://localhost:11434'
   */
  ollamaBaseUrl?: string
}
