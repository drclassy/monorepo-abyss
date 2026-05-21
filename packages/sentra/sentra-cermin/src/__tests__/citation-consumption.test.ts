// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { describe, expect, it } from 'vitest'

import { createCitationEvidenceViews, type ConsumableGroundedCitation } from '../citations'

function makeCitation(
  overrides: Partial<ConsumableGroundedCitation> = {}
): ConsumableGroundedCitation {
  return {
    citationLabel: '[1]',
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
      textSpan: {
        start: 12,
        end: 64,
      },
      ocrConfidence: 0.98,
      retrievalScore: 0.91,
      contentPreview: 'Evidence content from retrieved chunk.',
      traceabilityIssues: [],
    },
    ...overrides,
  }
}

describe('createCitationEvidenceViews', () => {
  it('converts Pustaka grounded citations into Cermin evidence views', () => {
    const [view] = createCitationEvidenceViews([makeCitation()])

    expect(view).toEqual({
      label: '[1]',
      sourceHash: 'source-hash-1',
      documentId: 'document-1',
      documentVersion: '2026-05-20',
      sourceTitle: 'Clinical Guideline',
      parserProvider: 'liteparse',
      chunkId: 'chunk-1',
      vectorId: 'vector-1',
      pageNumber: 7,
      chunkIndex: 4,
      textSpan: {
        start: 12,
        end: 64,
      },
      ocrConfidence: 0.98,
      retrievalScore: 0.91,
      contentPreview: 'Evidence content from retrieved chunk.',
      traceabilityIssues: [],
      isTraceable: true,
    })
  })

  it('preserves traceability issues without inventing missing metadata', () => {
    const [view] = createCitationEvidenceViews([
      makeCitation({
        source: {
          sourceHash: '',
        },
        evidence: {
          pageNumber: null,
          ocrConfidence: null,
          retrievalScore: 0.72,
          contentPreview: 'Partial evidence.',
          traceabilityIssues: ['missing_source_hash', 'missing_page_number'],
        },
      }),
    ])

    expect(view).toEqual({
      label: '[1]',
      sourceHash: '',
      pageNumber: null,
      ocrConfidence: null,
      retrievalScore: 0.72,
      contentPreview: 'Partial evidence.',
      traceabilityIssues: ['missing_source_hash', 'missing_page_number'],
      isTraceable: false,
    })
  })

  it('consumes Pustaka query-result citations without metadata loss', () => {
    const pustakaQueryResult = {
      answer: 'Clinical decision support answer.',
      citations: [
        makeCitation({
          citationLabel: '[7]',
          source: {
            sourceHash: 'source-hash-query-result',
            documentId: 'document-query-result',
            documentVersion: 'v2',
            sourceTitle: 'Pustaka Source',
            parserProvider: 'liteparse',
          },
          evidence: {
            chunkId: 'chunk-query-result',
            vectorId: 'vector-query-result',
            pageNumber: 12,
            chunkIndex: 8,
            textSpan: {
              start: 20,
              end: 128,
            },
            ocrConfidence: 0.87,
            retrievalScore: 0.74,
            contentPreview: 'Pustaka grounded citation evidence.',
            traceabilityIssues: ['review_required'],
          },
        }),
      ],
    }

    const [view] = createCitationEvidenceViews(pustakaQueryResult.citations)

    expect(view).toEqual({
      label: '[7]',
      sourceHash: 'source-hash-query-result',
      documentId: 'document-query-result',
      documentVersion: 'v2',
      sourceTitle: 'Pustaka Source',
      parserProvider: 'liteparse',
      chunkId: 'chunk-query-result',
      vectorId: 'vector-query-result',
      pageNumber: 12,
      chunkIndex: 8,
      textSpan: {
        start: 20,
        end: 128,
      },
      ocrConfidence: 0.87,
      retrievalScore: 0.74,
      contentPreview: 'Pustaka grounded citation evidence.',
      traceabilityIssues: ['review_required'],
      isTraceable: false,
    })
  })
})
