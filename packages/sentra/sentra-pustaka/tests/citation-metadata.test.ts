import { describe, expect, it } from 'vitest'

import {
  buildRetrievedChunkCitationMetadata,
  normalizeRetrievedChunkMetadata,
} from '../src/retrieval/citation-metadata'

describe('buildRetrievedChunkCitationMetadata', () => {
  it('preserves available citation metadata from retrieved chunk metadata', () => {
    const metadata = buildRetrievedChunkCitationMetadata({
      metadata: {
        source_hash: 'hash-123',
        page_number: 12,
        chunk_id: 'hash-123:p012:c0003',
        document_version: 'v2',
        ocr_confidence: 0.91,
      },
      retrievalScore: 0.82,
      chunkIndex: 2,
    })

    expect(metadata).toEqual({
      sourceHash: 'hash-123',
      pageNumber: 12,
      chunkId: 'hash-123:p012:c0003',
      chunkIndex: 2,
      documentVersion: 'v2',
      ocrConfidence: 0.91,
      retrievalScore: 0.82,
    })
  })

  it('does not invent missing citation metadata fields', () => {
    const metadata = buildRetrievedChunkCitationMetadata({
      metadata: {},
      retrievalScore: 0.64,
    })

    expect(metadata).toEqual({
      sourceHash: undefined,
      pageNumber: null,
      chunkId: undefined,
      chunkIndex: undefined,
      documentVersion: undefined,
      ocrConfidence: null,
      retrievalScore: 0.64,
    })
  })

  it('keeps retrieval score available when metadata is missing', () => {
    const metadata = buildRetrievedChunkCitationMetadata({
      metadata: null,
      retrievalScore: 0.77,
    })

    expect(metadata.retrievalScore).toBe(0.77)
    expect(metadata.pageNumber).toBeNull()
    expect(metadata.ocrConfidence).toBeNull()
  })
})

describe('normalizeRetrievedChunkMetadata', () => {
  it('preserves object metadata and rejects non-object metadata', () => {
    expect(normalizeRetrievedChunkMetadata({ source_hash: 'hash-123' })).toEqual({
      source_hash: 'hash-123',
    })
    expect(normalizeRetrievedChunkMetadata(null)).toEqual({})
    expect(normalizeRetrievedChunkMetadata(['not', 'metadata'])).toEqual({})
  })
})
