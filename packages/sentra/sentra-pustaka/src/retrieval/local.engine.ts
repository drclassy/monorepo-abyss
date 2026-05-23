// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { QueryResult, VectorStore } from '@sentra/cermin'

import { type OllamaEmbedder } from '../ingestion/embedder.js'
import { type PgVectorStore } from '../storage/pgvector.store.js'
import type { RetrievedChunk } from '../types.js'

type LocalSearchStore = Pick<PgVectorStore, 'similaritySearch'> | Pick<VectorStore, 'query'>

export class LocalBrainEngine {
  private store: LocalSearchStore
  private embedder?: OllamaEmbedder

  constructor(store: LocalSearchStore, embedder?: OllamaEmbedder) {
    this.store = store
    this.embedder = embedder
  }

  async search(query: string, topK = 5, category?: string): Promise<RetrievedChunk[]> {
    if ('query' in this.store) {
      const results = await this.store.query(query, topK)
      return results.map((result) => this.toRetrievedChunk(result))
    }

    if (!this.embedder) {
      throw new Error('[LocalBrainEngine] embedder is required for similaritySearch mode')
    }

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

  private toRetrievedChunk(result: QueryResult): RetrievedChunk {
    const metadata =
      typeof result.metadata === 'object' && result.metadata !== null
        ? (result.metadata as Record<string, unknown>)
        : {}

    const documentTitle =
      typeof metadata.document_title === 'string' && metadata.document_title.length > 0
        ? metadata.document_title
        : typeof metadata.document_id === 'string' && metadata.document_id.length > 0
          ? metadata.document_id
          : 'KnowledgeBase'

    return {
      id: result.id,
      sourceFile: documentTitle,
      category:
        typeof metadata.document_type === 'string' && metadata.document_type.length > 0
          ? metadata.document_type
          : 'gen',
      content: result.content,
      headingPath: [documentTitle],
      similarity: result.score,
      chunkIndex: typeof metadata.chunk_index === 'number' ? metadata.chunk_index : undefined,
      metadata,
      citationMetadata: {
        sourceHash: typeof metadata.source_hash === 'string' ? metadata.source_hash : undefined,
        pageNumber: typeof metadata.page_number === 'number' ? metadata.page_number : null,
        chunkId: typeof metadata.chunk_id === 'string' ? metadata.chunk_id : undefined,
        chunkIndex:
          typeof metadata.chunk_index === 'number' ? metadata.chunk_index : undefined,
        documentVersion:
          typeof metadata.document_version === 'string' ? metadata.document_version : undefined,
        ocrConfidence:
          typeof metadata.ocr_confidence === 'number' ? metadata.ocr_confidence : null,
        retrievalScore: result.score,
      },
    }
  }
}
