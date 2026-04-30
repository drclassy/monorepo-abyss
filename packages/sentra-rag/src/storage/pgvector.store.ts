// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import type { MedicalChunk, RetrievedChunk } from '../types.js'

dotenv.config()

export class PgVectorStore {
  private pool: Pool

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
    })
  }

  async initialize(): Promise<void> {
    await this.pool.query(`CREATE EXTENSION IF NOT EXISTS vector`)
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS medical_chunks (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_file TEXT        NOT NULL,
        category    TEXT        NOT NULL,
        chunk_index INTEGER     NOT NULL,
        heading_path TEXT[]     NOT NULL DEFAULT '{}',
        content     TEXT        NOT NULL,
        token_count INTEGER     NOT NULL DEFAULT 0,
        embedding   vector(768),
        metadata    JSONB,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(source_file, chunk_index)
      )
    `)
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS medical_chunks_embedding_idx
        ON medical_chunks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 50)
    `)
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS medical_chunks_category_idx
        ON medical_chunks (category)
    `)
  }

  async upsert(chunk: MedicalChunk): Promise<void> {
    const embeddingStr = chunk.embedding ? `[${chunk.embedding.join(',')}]` : null
    await this.pool.query(
      `INSERT INTO medical_chunks
         (source_file, category, chunk_index, heading_path, content, token_count, embedding, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7::vector,$8)
       ON CONFLICT (source_file, chunk_index)
       DO UPDATE SET
         content      = EXCLUDED.content,
         embedding    = EXCLUDED.embedding,
         token_count  = EXCLUDED.token_count,
         heading_path = EXCLUDED.heading_path,
         metadata     = EXCLUDED.metadata`,
      [
        chunk.sourceFile,
        chunk.category,
        chunk.chunkIndex,
        chunk.headingPath,
        chunk.content,
        chunk.tokenCount,
        embeddingStr,
        JSON.stringify(chunk.metadata ?? {}),
      ]
    )
  }

  async similaritySearch(
    embedding: number[],
    topK = 5,
    threshold = 0.3,
    category?: string
  ): Promise<RetrievedChunk[]> {
    const embeddingStr = `[${embedding.join(',')}]`
    const categoryFilter = category ? `AND category = $4` : ''
    const params: unknown[] = [embeddingStr, threshold, topK]
    if (category) params.push(category)

    const result = await this.pool.query(
      `SELECT
         id::text,
         source_file,
         category,
         content,
         heading_path,
         1 - (embedding <=> $1::vector) AS similarity
       FROM medical_chunks
       WHERE embedding IS NOT NULL
         AND 1 - (embedding <=> $1::vector) > $2
         ${categoryFilter}
       ORDER BY similarity DESC
       LIMIT $3`,
      params
    )

    return result.rows.map(r => ({
      id: r.id,
      sourceFile: r.source_file,
      category: r.category,
      content: r.content,
      headingPath: r.heading_path,
      similarity: parseFloat(r.similarity),
    }))
  }

  async fileExists(sourceFile: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT 1 FROM medical_chunks WHERE source_file = $1 LIMIT 1`,
      [sourceFile]
    )
    return (result.rowCount ?? 0) > 0
  }

  async stats(): Promise<{ total: number; byCategory: Record<string, number> }> {
    const total = await this.pool.query(`SELECT COUNT(*) FROM medical_chunks`)
    const byCat = await this.pool.query(
      `SELECT category, COUNT(*) FROM medical_chunks GROUP BY category ORDER BY category`
    )
    return {
      total: parseInt(total.rows[0].count),
      byCategory: Object.fromEntries(byCat.rows.map(r => [r.category, parseInt(r.count)])),
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}
