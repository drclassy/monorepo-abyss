// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { RetrievedChunk } from '../types.js'

import { type LocalBrainEngine } from './local.engine.js'

export interface HybridSearchResult {
  chunks: RetrievedChunk[]
  source: 'local'
}

/**
 * [B] Hybrid Brain — local pgvector only.
 * The previous Vertex fallback has been removed; local retrieval is the only source now.
 */
export class HybridBrainEngine {
  private local: LocalBrainEngine
  private minLocalResults: number

  constructor(local: LocalBrainEngine, minLocalResults = 2) {
    this.local = local
    this.minLocalResults = minLocalResults
  }

  async search(query: string, topK = 5): Promise<HybridSearchResult> {
    const localChunks = await this.local.search(query, topK)

    if (localChunks.length < this.minLocalResults) {
      console.warn(
        '[HybridBrain] Local retrieval returned fewer chunks than target; continuing without cloud fallback.'
      )
    }

    return { chunks: localChunks, source: 'local' }
  }
}
