import type { EmbeddingTaskType } from './vertex-provider'

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
 * Implementation: caller-owned pgvector store + Vertex AI embeddings.
 * Auth for embeddings is resolved via GOOGLE_APPLICATION_CREDENTIALS — not API keys.
 */
export interface VectorStoreConfig {
  /**
   * Prisma-compatible database client owned by the caller app.
   */
  database?: VectorStoreDatabaseClient

  /**
   * Vertex AI embedding model to use.
   * @default 'text-embedding-004'
   */
  embeddingModel?: string

  /**
   * Expected output dimension of the embedding model.
   * Must match the `vector(N)` declaration in the KnowledgeBase Prisma schema.
   * @default 768  (correct for text-embedding-004)
   */
  embeddingDimensions?: number

  /**
   * GCP Project ID. Overrides the GCP_PROJECT_ID environment variable.
   */
  gcpProjectId?: string

  /**
   * GCP region for Vertex AI endpoint.
   * @default 'us-central1'
   */
  gcpLocation?: string

  /**
   * Semantic task hint sent to the embedding model.
   * Use RETRIEVAL_DOCUMENT when ingesting, RETRIEVAL_QUERY when searching.
   * @default 'RETRIEVAL_DOCUMENT'
   */
  defaultTaskType?: EmbeddingTaskType
}
