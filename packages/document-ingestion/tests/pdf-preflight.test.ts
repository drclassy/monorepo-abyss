import { describe, it, expect } from 'vitest'
import { detectPdfPreflight } from '../src/detection/pdf-preflight'
import type { CanonicalPage } from '../src/types'

function makePage(pageNumber: number, textDensity: number): CanonicalPage {
  return {
    pageNumber,
    text: 'x'.repeat(textDensity),
    markdown: 'x'.repeat(textDensity),
    parserProvider: 'liteparse',
    ocrConfidence: null,
    textDensity,
    requiresReview: false,
  }
}

describe('detectPdfPreflight', () => {
  it('returns unknown for empty pages array', () => {
    const result = detectPdfPreflight([])
    expect(result.documentType).toBe('unknown')
    expect(result.requiresOcr).toBe(true)
    expect(result.confidence).toBe(0)
  })

  it('detects digital_pdf when majority of pages have high text density', () => {
    const pages = [
      makePage(1, 500),
      makePage(2, 800),
      makePage(3, 600),
      makePage(4, 400),
    ]
    const result = detectPdfPreflight(pages)
    expect(result.documentType).toBe('digital_pdf')
    expect(result.requiresOcr).toBe(false)
    expect(result.confidence).toBeGreaterThan(0.7)
  })

  it('detects scanned_pdf when majority of pages have low text density', () => {
    const pages = [
      makePage(1, 5),
      makePage(2, 0),
      makePage(3, 10),
      makePage(4, 200), // one digital page
    ]
    const result = detectPdfPreflight(pages)
    expect(result.documentType).toBe('scanned_pdf')
    expect(result.requiresOcr).toBe(true)
  })

  it('detects hybrid_pdf for mixed pages', () => {
    const pages = [
      makePage(1, 500), // digital
      makePage(2, 5),   // scanned
      makePage(3, 600), // digital
      makePage(4, 3),   // scanned
    ]
    const result = detectPdfPreflight(pages)
    expect(result.documentType).toBe('hybrid_pdf')
    expect(result.requiresOcr).toBe(true)
  })

  it('returns page signals with correct structure', () => {
    const pages = [makePage(1, 100), makePage(2, 5)]
    const result = detectPdfPreflight(pages)
    expect(result.pageSignals).toHaveLength(2)
    expect(result.pageSignals[0].pageNumber).toBe(1)
    expect(result.pageSignals[0].hasExtractableText).toBe(true)
    expect(result.pageSignals[1].hasExtractableText).toBe(false)
  })
})
