import { describe, it, expect } from 'vitest'
import { toChunkerInput } from '../src/chunking/chunker-adapter'
import type { CanonicalDocument } from '../src/types'

function makeDoc(status: 'ready' | 'needs_review' | 'failed'): CanonicalDocument {
  return {
    documentId: 'doc_test123_v1',
    sourceHash: 'deadbeef'.repeat(8),
    documentVersion: 'v1',
    documentTitle: 'Test Medical Guideline',
    parserProvider: 'liteparse',
    createdAt: '2026-04-27T00:00:00.000Z',
    preflight: {
      documentType: 'digital_pdf',
      requiresOcr: false,
      confidence: 0.9,
      reason: 'test',
      pageSignals: [],
    },
    qualityReport: {
      status,
      totalPages: 3,
      failedPages: [],
      lowConfidencePages: [],
      averageOcrConfidence: null,
      documentType: 'digital_pdf',
      requiresReview: status === 'needs_review',
      warnings: [],
    },
    pages: [
      {
        pageNumber: 1,
        text: 'Page one content',
        markdown: 'Page one content',
        parserProvider: 'liteparse',
        ocrConfidence: null,
        textDensity: 16,
        requiresReview: false,
      },
      {
        pageNumber: 2,
        text: '',
        markdown: '',
        parserProvider: 'liteparse',
        ocrConfidence: null,
        textDensity: 0,
        requiresReview: false,
      },
      {
        pageNumber: 3,
        text: 'Page three content',
        markdown: 'Page three content',
        parserProvider: 'liteparse',
        ocrConfidence: 0.92,
        textDensity: 18,
        requiresReview: false,
      },
    ],
    metadata: {
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
      pageCount: 3,
    },
  }
}

describe('toChunkerInput', () => {
  it('returns empty array for failed documents', () => {
    const doc = makeDoc('failed')
    expect(toChunkerInput(doc)).toHaveLength(0)
  })

  it('excludes empty pages', () => {
    const doc = makeDoc('ready')
    const chunks = toChunkerInput(doc)
    expect(chunks.every((c) => c.content.trim().length > 0)).toBe(true)
  })

  it('preserves page numbers in metadata', () => {
    const doc = makeDoc('ready')
    const chunks = toChunkerInput(doc)
    const pageNumbers = chunks.map((c) => c.metadata.page_number)
    expect(pageNumbers).toContain(1)
    expect(pageNumbers).toContain(3)
    expect(pageNumbers).not.toContain(2) // empty page excluded
  })

  it('includes all required metadata fields', () => {
    const doc = makeDoc('ready')
    const chunks = toChunkerInput(doc)
    for (const chunk of chunks) {
      expect(chunk.metadata).toHaveProperty('source_hash')
      expect(chunk.metadata).toHaveProperty('page_number')
      expect(chunk.metadata).toHaveProperty('parser_provider')
      expect(chunk.metadata).toHaveProperty('ocr_confidence')
      expect(chunk.metadata).toHaveProperty('document_version')
      expect(chunk.metadata).toHaveProperty('document_title')
      expect(chunk.metadata).toHaveProperty('ingestion_status')
    }
  })

  it('preserves source_hash from document', () => {
    const doc = makeDoc('ready')
    const chunks = toChunkerInput(doc)
    expect(chunks[0].metadata.source_hash).toBe(doc.sourceHash)
  })

  it('processes needs_review documents (does not block)', () => {
    const doc = makeDoc('needs_review')
    const chunks = toChunkerInput(doc)
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks[0].metadata.ingestion_status).toBe('needs_review')
  })

  it('preserves OCR confidence in metadata', () => {
    const doc = makeDoc('ready')
    const chunks = toChunkerInput(doc)
    const page3Chunk = chunks.find((c) => c.metadata.page_number === 3)
    expect(page3Chunk?.metadata.ocr_confidence).toBe(0.92)
  })
})
