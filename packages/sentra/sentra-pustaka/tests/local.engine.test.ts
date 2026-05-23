import type { QueryResult } from '@sentra/cermin'
import { describe, expect, it } from 'vitest'

import { LocalBrainEngine } from '../src/retrieval/local.engine.js'

function makeQueryResult(overrides: Partial<QueryResult> = {}): QueryResult {
  return {
    id: 'kb:hash:v1:p001:c0001',
    content: 'Tatalaksana hipertensi.',
    score: 0.93,
    metadata: {
      source_hash: 'hash-1',
      document_id: 'doc-1',
      document_title: 'Pedoman Hipertensi',
      document_version: 'v1',
      document_type: 'guideline',
      chunk_id: 'chunk-1',
      page_number: 2,
      ocr_confidence: 0.99,
    },
    ...overrides,
  }
}

describe('LocalBrainEngine', () => {
  it('maps KnowledgeBase vector results into retrieved chunks', async () => {
    const engine = new LocalBrainEngine({
      query: async () => [makeQueryResult()],
    })

    const results = await engine.search('hipertensi', 5)

    expect(results).toEqual([
      expect.objectContaining({
        id: 'kb:hash:v1:p001:c0001',
        sourceFile: 'Pedoman Hipertensi',
        category: 'guideline',
        headingPath: ['Pedoman Hipertensi'],
        similarity: 0.93,
      }),
    ])
    expect(results[0].citationMetadata).toMatchObject({
      sourceHash: 'hash-1',
      pageNumber: 2,
      chunkId: 'chunk-1',
      documentVersion: 'v1',
      ocrConfidence: 0.99,
      retrievalScore: 0.93,
    })
  })
})
