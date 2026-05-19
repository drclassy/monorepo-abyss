import { describe, it, expect } from 'vitest'

import { renderMarkdown } from '../src/normalization/markdown-renderer'
import type { CanonicalDocument } from '../src/types'

function makeDoc(overrides: Partial<CanonicalDocument> = {}): CanonicalDocument {
  return {
    documentId: 'doc_abc123_v1',
    sourceHash: 'abc123def456abc123def456abc123def456abc123def456abc123def456abc1',
    documentVersion: 'v1',
    documentTitle: 'Test Document',
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
      status: 'ready',
      totalPages: 2,
      failedPages: [],
      lowConfidencePages: [],
      averageOcrConfidence: null,
      documentType: 'digital_pdf',
      requiresReview: false,
      warnings: [],
    },
    pages: [
      {
        pageNumber: 1,
        text: 'First page content',
        markdown: 'First page content',
        parserProvider: 'liteparse',
        ocrConfidence: null,
        textDensity: 18,
        requiresReview: false,
      },
      {
        pageNumber: 2,
        text: 'Second page content',
        markdown: 'Second page content',
        parserProvider: 'liteparse',
        ocrConfidence: null,
        textDensity: 19,
        requiresReview: false,
      },
    ],
    metadata: {
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
      pageCount: 2,
    },
    ...overrides,
  }
}

describe('renderMarkdown', () => {
  it('includes YAML frontmatter', () => {
    const md = renderMarkdown(makeDoc())
    expect(md).toContain('---')
    expect(md).toContain('document_id: doc_abc123_v1')
    expect(md).toContain('source_hash:')
    expect(md).toContain('document_version: v1')
    expect(md).toContain('parser_provider: liteparse')
    expect(md).toContain('ingestion_status: ready')
  })

  it('includes page boundary HTML comments', () => {
    const md = renderMarkdown(makeDoc())
    expect(md).toContain('<!-- source_hash:')
    expect(md).toContain('page_number:1')
    expect(md).toContain('page_number:2')
    expect(md).toContain('parser_provider:liteparse')
  })

  it('includes page headings', () => {
    const md = renderMarkdown(makeDoc())
    expect(md).toContain('## Page 1')
    expect(md).toContain('## Page 2')
  })

  it('includes page content', () => {
    const md = renderMarkdown(makeDoc())
    expect(md).toContain('First page content')
    expect(md).toContain('Second page content')
  })

  it('is deterministic — same input same output', () => {
    const doc = makeDoc()
    expect(renderMarkdown(doc)).toBe(renderMarkdown(doc))
  })

  it('shows empty page placeholder for blank pages', () => {
    const doc = makeDoc()
    doc.pages[0].text = ''
    const md = renderMarkdown(doc)
    expect(md).toContain('_[empty page]_')
  })

  it('includes document_title in frontmatter when present', () => {
    const md = renderMarkdown(makeDoc({ documentTitle: 'PNPK Hipertensi 2024' }))
    expect(md).toContain('document_title: "PNPK Hipertensi 2024"')
  })

  it('omits document_title from frontmatter when absent', () => {
    const doc = makeDoc()
    doc.documentTitle = undefined
    const md = renderMarkdown(doc)
    expect(md).not.toContain('document_title')
  })
})
