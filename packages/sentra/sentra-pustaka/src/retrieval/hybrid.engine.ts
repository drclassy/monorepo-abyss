// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { QueryResult, SearchBackend } from '@sentra/cermin'

import type { RetrievedChunk } from '../types.js'

import { type LocalBrainEngine } from './local.engine.js'

export interface HybridSearchResult {
  chunks: RetrievedChunk[]
  source: 'local' | 'hybrid'
}

/**
 * [B] Hybrid Brain — local pgvector first, optional cloud search second.
 * Local-only behavior remains the default when no cloud backend is configured.
 */
export class HybridBrainEngine {
  private local: LocalBrainEngine
  private minLocalResults: number
  private cloudBackend?: SearchBackend

  constructor(local: LocalBrainEngine, minLocalResults = 2, cloudBackend?: SearchBackend) {
    this.local = local
    this.minLocalResults = minLocalResults
    this.cloudBackend = cloudBackend
  }

  async search(query: string, topK = 5): Promise<HybridSearchResult> {
    const localPromise = this.local.search(query, topK)

    if (!this.cloudBackend) {
      const localChunks = await localPromise

      if (localChunks.length < this.minLocalResults) {
        console.warn(
          '[HybridBrain] Local retrieval returned fewer chunks than target; continuing without cloud fallback.'
        )
      }

      return { chunks: localChunks, source: 'local' }
    }

    const cloudPromise = this.cloudBackend.query(query, topK)
    const [localResult, cloudResult] = await Promise.allSettled([localPromise, cloudPromise])

    const safeLocalChunks = localResult.status === 'fulfilled' ? localResult.value : []
    const safeCloudChunks =
      cloudResult.status === 'fulfilled'
        ? cloudResult.value.map((result) => this.toRetrievedChunk(result))
        : []

    if (cloudResult.status === 'rejected') {
      console.warn(`[HybridBrain] Cloud backend query failed: ${String(cloudResult.reason)}`)
    }

    if (safeLocalChunks.length < this.minLocalResults && safeCloudChunks.length === 0) {
      console.warn(
        '[HybridBrain] Local retrieval returned fewer chunks than target; continuing without cloud fallback.'
      )
    }

    return {
      chunks: this.mergeAndRank([...safeLocalChunks, ...safeCloudChunks], topK),
      source: safeCloudChunks.length > 0 ? 'hybrid' : 'local',
    }
  }

  private toRetrievedChunk(result: QueryResult): RetrievedChunk {
    return {
      id: result.id,
      sourceFile: String(result.metadata.source ?? 'openai-file-search'),
      category: String(result.metadata.category ?? 'gen'),
      content: result.content,
      headingPath: [String(result.metadata.source ?? 'OpenAI File Search')],
      similarity: result.score,
      chunkIndex:
        typeof result.metadata.chunk_index === 'number' ? result.metadata.chunk_index : undefined,
      metadata: result.metadata,
      citationMetadata: {
        sourceHash:
          typeof result.metadata.source_hash === 'string' ? result.metadata.source_hash : undefined,
        pageNumber:
          typeof result.metadata.page_number === 'number' ? result.metadata.page_number : null,
        chunkId: typeof result.metadata.chunk_id === 'string' ? result.metadata.chunk_id : undefined,
        chunkIndex:
          typeof result.metadata.chunk_index === 'number' ? result.metadata.chunk_index : undefined,
        documentVersion:
          typeof result.metadata.document_version === 'string'
            ? result.metadata.document_version
            : undefined,
        ocrConfidence:
          typeof result.metadata.ocr_confidence === 'number'
            ? result.metadata.ocr_confidence
            : null,
        retrievalScore: result.score,
      },
    }
  }

  private mergeAndRank(chunks: RetrievedChunk[], topK: number): RetrievedChunk[] {
    const deduped = new Map<string, RetrievedChunk>()

    for (const chunk of chunks) {
      const key = chunk.content.slice(0, 128)
      const existing = deduped.get(key)
      if (!existing || chunk.similarity > existing.similarity) {
        deduped.set(key, chunk)
      }
    }

    return [...deduped.values()].sort((a, b) => b.similarity - a.similarity).slice(0, topK)
  }
}
