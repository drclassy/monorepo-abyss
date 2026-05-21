import { describe, expect, it } from 'vitest'

import { formatGroundedCitations } from '../src/citation/formatter'
import type { RetrievedChunk } from '../src/types'

function makeChunk(overrides: Partial<RetrievedChunk> = {}): RetrievedChunk {
  return {
    id: 'kb:hash-123:v2:p012:c0003',
    sourceFile: 'clinical/source.md',
    category: 'gen',
    content: 'Evidence content from retrieved chunk.',
    headingPath: ['Clinical', 'Evidence'],
    similarity: 0.82,
    chunkIndex: 2,
    metadata: {
      source_hash: 'hash-123',
      document_id: 'doc-123',
      document_version: 'v2',
      document_title: 'Clinical Source',
      parser_provider: 'liteparse',
      chunk_id: 'hash-123:p012:c0003',
      vector_id: 'kb:hash-123:v2:p012:c0003',
      page_number: 12,
      ocr_confidence: 0.91,
      text_span_start: 10,
      text_span_end: 80,
    },
    citationMetadata: {
      sourceHash: 'hash-123',
      pageNumber: 12,
      chunkId: 'hash-123:p012:c0003',
      chunkIndex: 2,
      documentVersion: 'v2',
      ocrConfidence: 0.91,
      retrievalScore: 0.82,
    },
    ...overrides,
  }
}

describe('formatGroundedCitations', () => {
  it('formats retrieved chunk metadata into deterministic grounded citations', () => {
    const citations = formatGroundedCitations([makeChunk(), makeChunk({ id: 'vector-2' })])

    expect(citations.map((citation) => citation.citationLabel)).toEqual(['[1]', '[2]'])
    expect(citations[0]).toEqual({
      citationLabel: '[1]',
      source: {
        sourceHash: 'hash-123',
        documentId: 'doc-123',
        documentVersion: 'v2',
        sourceTitle: 'Clinical Source',
        parserProvider: 'liteparse',
      },
      evidence: {
        chunkId: 'hash-123:p012:c0003',
        vectorId: 'kb:hash-123:v2:p012:c0003',
        pageNumber: 12,
        chunkIndex: 2,
        textSpan: {
          start: 10,
          end: 80,
        },
        ocrConfidence: 0.91,
        retrievalScore: 0.82,
        contentPreview: 'Evidence content from retrieved chunk.',
        traceabilityIssues: [],
      },
    })
  })

  it('flags missing metadata without inventing citation fields', () => {
    const citations = formatGroundedCitations([
      makeChunk({
        id: '',
        content: '',
        chunkIndex: undefined,
        metadata: {},
        citationMetadata: {
          pageNumber: null,
          ocrConfidence: null,
          retrievalScore: 0.64,
        },
      }),
    ])

    expect(citations[0].source).toEqual({ sourceHash: '' })
    expect(citations[0].evidence).toEqual({
      pageNumber: null,
      ocrConfidence: null,
      retrievalScore: 0.64,
      contentPreview: '',
      traceabilityIssues: [
        'missing_source_hash',
        'missing_document_id',
        'missing_document_version',
        'missing_source_title',
        'missing_parser_provider',
        'missing_chunk_id',
        'missing_vector_id',
        'missing_page_number',
        'missing_chunk_index',
        'missing_ocr_confidence',
        'missing_content_preview',
      ],
    })
  })

  it('keeps retrieval score as retrieval metadata only', () => {
    const [citation] = formatGroundedCitations([
      makeChunk({
        similarity: 0.12,
        citationMetadata: undefined,
      }),
    ])

    expect(citation.evidence.retrievalScore).toBe(0.12)
    expect(citation.evidence).not.toHaveProperty('clinicalConfidence')
  })
})
