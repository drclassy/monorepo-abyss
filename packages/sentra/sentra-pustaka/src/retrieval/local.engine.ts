// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { type OllamaEmbedder } from '../ingestion/embedder.js'
import { type PgVectorStore } from '../storage/pgvector.store.js'
import type { RetrievedChunk } from '../types.js'

export class LocalBrainEngine {
  private store: PgVectorStore
  private embedder: OllamaEmbedder

  constructor(store: PgVectorStore, embedder: OllamaEmbedder) {
    this.store = store
    this.embedder = embedder
  }

  async search(query: string, topK = 5, category?: string): Promise<RetrievedChunk[]> {
    const embedding = await this.embedder.embed(query)
    return this.store.similaritySearch(embedding, topK, 0.3, category)
  }

  formatContext(chunks: RetrievedChunk[]): string {
    if (chunks.length === 0) return 'Tidak ada referensi ditemukan di database lokal.'

    return chunks
      .map((c, i) => {
        const path = c.headingPath.join(' > ')
        const source = c.sourceFile.split('/').pop() ?? c.sourceFile
        return `[${i + 1}] ${path}\nSumber: ${source} (similarity: ${(c.similarity * 100).toFixed(0)}%)\n\n${c.content}`
      })
      .join('\n\n---\n\n')
  }
}
