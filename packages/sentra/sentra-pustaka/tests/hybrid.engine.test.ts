// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { QueryResult, SearchBackend } from '@sentra/cermin'
import { describe, expect, it } from 'vitest'

import { HybridBrainEngine } from '../src/retrieval/hybrid.engine.js'
import type { LocalBrainEngine } from '../src/retrieval/local.engine.js'
import type { RetrievedChunk } from '../src/types.js'

function makeLocalChunk(overrides: Partial<RetrievedChunk> = {}): RetrievedChunk {
  return {
    id: 'local-1',
    sourceFile: 'local-guideline.md',
    category: 'gen',
    content: 'Local evidence',
    headingPath: ['Guideline'],
    similarity: 0.82,
    chunkIndex: 0,
    metadata: {
      source_hash: 'local-hash',
      page_number: 1,
    },
    citationMetadata: {
      sourceHash: 'local-hash',
      pageNumber: 1,
      chunkIndex: 0,
      ocrConfidence: null,
      retrievalScore: 0.82,
    },
    ...overrides,
  }
}

function makeCloudResult(overrides: Partial<QueryResult> = {}): QueryResult {
  return {
    id: 'cloud-1',
    content: 'Cloud evidence',
    score: 0.91,
    metadata: {
      source: 'openai-file-search',
      category: 'gen',
      source_hash: 'cloud-hash',
      page_number: 3,
      chunk_index: 2,
    },
    ...overrides,
  }
}

function makeLocalEngine(chunks: RetrievedChunk[]): LocalBrainEngine {
  return {
    search: async () => chunks,
    formatContext: () => '',
  } as unknown as LocalBrainEngine
}

function makeFailingLocalEngine(error: Error): LocalBrainEngine {
  return {
    search: async () => {
      throw error
    },
    formatContext: () => '',
  } as unknown as LocalBrainEngine
}

describe('HybridBrainEngine', () => {
  it('keeps local-only behavior when no cloud backend is configured', async () => {
    const localChunks = [makeLocalChunk()]
    const engine = new HybridBrainEngine(makeLocalEngine(localChunks), 2)

    const result = await engine.search('hipertensi', 5)

    expect(result.source).toBe('local')
    expect(result.chunks).toEqual(localChunks)
  })

  it('merges local and cloud results when optional backend returns evidence', async () => {
    const localChunks = [makeLocalChunk()]
    const cloudBackend: SearchBackend = {
      name: 'openai-file-search',
      query: async () => [makeCloudResult()],
    }
    const engine = new HybridBrainEngine(makeLocalEngine(localChunks), 2, cloudBackend)

    const result = await engine.search('hipertensi', 5)

    expect(result.source).toBe('hybrid')
    expect(result.chunks).toHaveLength(2)
    expect(result.chunks[0]).toMatchObject({
      id: 'cloud-1',
      sourceFile: 'openai-file-search',
      content: 'Cloud evidence',
      similarity: 0.91,
    })
    expect(result.chunks[1]).toMatchObject({
      id: 'local-1',
      sourceFile: 'local-guideline.md',
      content: 'Local evidence',
      similarity: 0.82,
    })
  })

  it('falls back to cloud results when local retrieval fails', async () => {
    const cloudBackend: SearchBackend = {
      name: 'openai-file-search',
      query: async () => [makeCloudResult()],
    }
    const engine = new HybridBrainEngine(
      makeFailingLocalEngine(new Error('local pgvector down')),
      2,
      cloudBackend
    )

    const result = await engine.search('hipertensi', 5)

    expect(result.source).toBe('hybrid')
    expect(result.chunks).toHaveLength(1)
    expect(result.chunks[0]).toMatchObject({
      id: 'cloud-1',
      sourceFile: 'openai-file-search',
      content: 'Cloud evidence',
    })
  })
})
