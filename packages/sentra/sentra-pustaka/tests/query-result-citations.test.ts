// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import { attachGroundedCitations } from '../src/citation/query-result'
import type { RAGQueryResult, RetrievedChunk } from '../src/types'

function makeChunk(overrides: Partial<RetrievedChunk> = {}): RetrievedChunk {
  return {
    id: 'vector-1',
    sourceFile: 'clinical-guideline.md',
    category: 'gen',
    content: 'Evidence content from retrieved chunk.',
    headingPath: ['Guideline', 'Assessment'],
    similarity: 0.91,
    chunkIndex: 4,
    metadata: {
      source_hash: 'source-hash-1',
      document_id: 'document-1',
      document_version: '2026-05-20',
      document_title: 'Clinical Guideline',
      parser_provider: 'liteparse',
      chunk_id: 'chunk-1',
      page_number: 7,
      ocr_confidence: 0.98,
    },
    citationMetadata: {
      sourceHash: 'source-hash-1',
      pageNumber: 7,
      chunkId: 'chunk-1',
      chunkIndex: 4,
      documentVersion: '2026-05-20',
      ocrConfidence: 0.98,
      retrievalScore: 0.91,
    },
    ...overrides,
  }
}

function makeResult(overrides: Partial<RAGQueryResult> = {}): RAGQueryResult {
  return {
    answer: 'Clinical decision support answer.',
    chunks: [makeChunk()],
    source: 'local',
    model: 'gemma3:12b via Sentra RAG Engine',
    status: 'SUCCESS',
    timestamp: '2026-05-20T00:00:00.000Z',
    ...overrides,
  }
}

describe('attachGroundedCitations', () => {
  it('attaches deterministic grounded citations from retrieved chunks', () => {
    const result = attachGroundedCitations(
      makeResult({
        chunks: [makeChunk(), makeChunk({ id: 'vector-2' })],
      })
    )

    expect(result.citations?.map((citation) => citation.citationLabel)).toEqual(['[1]', '[2]'])
    expect(result.citations?.[0]).toMatchObject({
      source: {
        sourceHash: 'source-hash-1',
        documentId: 'document-1',
        documentVersion: '2026-05-20',
        sourceTitle: 'Clinical Guideline',
        parserProvider: 'liteparse',
      },
      evidence: {
        chunkId: 'chunk-1',
        vectorId: 'vector-1',
        pageNumber: 7,
        chunkIndex: 4,
        ocrConfidence: 0.98,
        retrievalScore: 0.91,
        contentPreview: 'Evidence content from retrieved chunk.',
        traceabilityIssues: [],
      },
    })
  })

  it('preserves answer result fields while adding citation output', () => {
    const base = makeResult()
    const result = attachGroundedCitations(base)

    expect(result).toMatchObject({
      answer: base.answer,
      chunks: base.chunks,
      source: base.source,
      model: base.model,
      status: base.status,
      timestamp: base.timestamp,
    })
    expect(result.citations).toHaveLength(1)
  })

  it('does not invent citations when no retrieved chunks are present', () => {
    const base = makeResult({ chunks: [] })
    const result = attachGroundedCitations(base)

    expect(result).toBe(base)
    expect(result.citations).toBeUndefined()
  })
})
