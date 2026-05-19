// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { getEmbedding, DEFAULT_EMBEDDING_MODEL } from './embedding-provider'
import type { QueryResult, VectorStoreConfig, VectorStoreDatabaseClient } from './types'

// ─── VectorStore ──────────────────────────────────────────────────────────────

/**
 * pgvector-backed vector store using local Ollama for embedding generation.
 *
 * Storage  : caller-owned KnowledgeBase table on PostgreSQL + pgvector
 * Embedding: Ollama `nomic-embed-text` via local HTTP API
 *
 * Raw SQL is intentional — Prisma does not support `vector` column operations
 * natively (declared as `Unsupported("vector(768)")` in schema.prisma).
 */
export class VectorStore {
  private readonly config: VectorStoreConfig

  constructor(config: VectorStoreConfig = {}) {
    this.config = config
  }

  private database(): VectorStoreDatabaseClient {
    if (!this.config.database) {
      throw new Error(
        '[vector-store] database client is required. Inject the caller app Prisma client via VectorStoreConfig.database.'
      )
    }

    return this.config.database
  }

  // ─── Upsert ─────────────────────────────────────────────────────────────────

  /**
   * Embeds `content` via Ollama and upserts the record using the caller-supplied
   * stable ID. Idempotent: repeated calls with the same `id` update the record
   * rather than insert a duplicate.
   *
   * @param id       - Stable, caller-owned vector ID (e.g. kb:hash:v1:p001:c0001)
   * @param content  - Text to embed
   * @param metadata - Arbitrary JSON metadata stored alongside the vector
   */
  async upsertById(
    id: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    const db = this.database()
    const embedding = await getEmbedding(content, {
      model: this.config.embeddingModel ?? DEFAULT_EMBEDDING_MODEL,
      ollamaBaseUrl: this.config.ollamaBaseUrl,
    })

    const embeddingLiteral = `[${embedding.join(',')}]`

    await db.$executeRawUnsafe(
      `INSERT INTO "KnowledgeBase" (id, content, embedding, metadata, "updatedAt")
       VALUES ($1, $2, $3::vector, $4::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET
         content    = EXCLUDED.content,
         embedding  = EXCLUDED.embedding,
         metadata   = EXCLUDED.metadata,
         "updatedAt" = NOW()`,
      id,
      content,
      embeddingLiteral,
      JSON.stringify(metadata)
    )
  }

  /**
   * Embeds `content` via Ollama and persists it to the KnowledgeBase table.
   * @returns the new record's UUID
   */
  async upsert(content: string, metadata: Record<string, unknown> = {}): Promise<string> {
    const db = this.database()
    const embedding = await getEmbedding(content, {
      model: this.config.embeddingModel ?? DEFAULT_EMBEDDING_MODEL,
      ollamaBaseUrl: this.config.ollamaBaseUrl,
    })

    const id = crypto.randomUUID()
    const embeddingLiteral = `[${embedding.join(',')}]`

    await db.$executeRawUnsafe(
      `INSERT INTO "KnowledgeBase" (id, content, embedding, metadata, "updatedAt")
       VALUES ($1, $2, $3::vector, $4::jsonb, NOW())`,
      id,
      content,
      embeddingLiteral,
      JSON.stringify(metadata)
    )

    return id
  }

  // ─── Query ───────────────────────────────────────────────────────────────────

  /**
   * Embeds `userQuery` and returns the top-k most similar documents.
   * Similarity metric: cosine similarity (1 - cosine distance).
   *
   * @param userQuery - Natural language question
   * @param limit     - Max number of results (default: 5)
   */
  async query(userQuery: string, limit = 5): Promise<QueryResult[]> {
    const db = this.database()
    const queryEmbedding = await getEmbedding(userQuery, {
      model: this.config.embeddingModel ?? DEFAULT_EMBEDDING_MODEL,
      ollamaBaseUrl: this.config.ollamaBaseUrl,
    })

    const embeddingLiteral = `[${queryEmbedding.join(',')}]`

    // Set ef_search before similarity query. Medical RAG favors recall over
    // minimal latency; this must remain aligned with the HNSW index decision.
    await db.$executeRawUnsafe(`SET hnsw.ef_search = 100`)

    const rows = await db.$queryRawUnsafe<
      Array<{ id: string; content: string; metadata: unknown; score: number }>
    >(
      `SELECT id, content, metadata,
              1 - (embedding <=> $1::vector) AS score
       FROM   "KnowledgeBase"
       ORDER  BY embedding <=> $1::vector
       LIMIT  $2::int`,
      embeddingLiteral,
      limit
    )

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      score: Number(row.score),
      metadata: (row.metadata as Record<string, unknown>) ?? {},
    }))
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  /**
   * Removes a single document by ID.
   */
  async delete(id: string): Promise<void> {
    const db = this.database()
    await db.$executeRawUnsafe(`DELETE FROM "KnowledgeBase" WHERE id = $1`, id)
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createVectorStore(config: VectorStoreConfig = {}): VectorStore {
  return new VectorStore(config)
}
