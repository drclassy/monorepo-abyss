import { describe, it, expect } from 'vitest'
import { createOcrQualityReport } from '../src/quality/ocr-quality-report'
import type { CanonicalPage, PdfPreflightResult } from '../src/types'

function makeDigitalPreflight(): PdfPreflightResult {
  return {
    documentType: 'digital_pdf',
    requiresOcr: false,
    confidence: 0.9,
    reason: 'test',
    pageSignals: [],
  }
}

function makeScannedPreflight(): PdfPreflightResult {
  return {
    documentType: 'scanned_pdf',
    requiresOcr: true,
    confidence: 0.9,
    reason: 'test',
    pageSignals: [],
  }
}

function makePage(
  pageNumber: number,
  text: string,
  ocrConfidence: number | null = null,
): CanonicalPage {
  return {
    pageNumber,
    text,
    markdown: text,
    parserProvider: 'liteparse',
    ocrConfidence,
    textDensity: text.length,
    requiresReview: false,
  }
}

describe('createOcrQualityReport', () => {
  it('returns failed for empty pages array', () => {
    const report = createOcrQualityReport([], makeDigitalPreflight())
    expect(report.status).toBe('failed')
    expect(report.totalPages).toBe(0)
  })

  it('returns failed when all pages are empty', () => {
    const pages = [makePage(1, ''), makePage(2, '   ')]
    const report = createOcrQualityReport(pages, makeDigitalPreflight())
    expect(report.status).toBe('failed')
    expect(report.failedPages).toEqual([1, 2])
  })

  it('returns ready for good digital PDF with no OCR confidence', () => {
    const pages = [
      makePage(1, 'Lorem ipsum dolor sit amet consectetur', null),
      makePage(2, 'Another page with sufficient content', null),
    ]
    const report = createOcrQualityReport(pages, makeDigitalPreflight())
    expect(report.status).toBe('ready')
    expect(report.averageOcrConfidence).toBeNull()
  })

  it('returns needs_review for low OCR confidence page', () => {
    const pages = [
      makePage(1, 'Some text', 0.95),
      makePage(2, 'Blurry text', 0.60), // below 0.75 threshold
    ]
    const report = createOcrQualityReport(pages, makeScannedPreflight())
    expect(report.status).toBe('needs_review')
    expect(report.lowConfidencePages).toContain(2)
  })

  it('returns needs_review for scanned PDF without OCR confidence', () => {
    const pages = [
      makePage(1, 'extracted text', null),
      makePage(2, 'more text', null),
    ]
    const report = createOcrQualityReport(pages, makeScannedPreflight())
    expect(report.status).toBe('needs_review')
    expect(report.warnings.some((w) => w.includes('no OCR confidence'))).toBe(true)
  })

  it('correctly identifies failed pages', () => {
    const pages = [
      makePage(1, 'valid text'),
      makePage(2, ''),
      makePage(3, 'more text'),
    ]
    const report = createOcrQualityReport(pages, makeDigitalPreflight())
    expect(report.failedPages).toContain(2)
    expect(report.failedPages).not.toContain(1)
    expect(report.failedPages).not.toContain(3)
  })

  it('computes average OCR confidence correctly', () => {
    const pages = [
      makePage(1, 'text', 0.80),
      makePage(2, 'text', 0.90),
      makePage(3, 'text', 0.70),
    ]
    const report = createOcrQualityReport(pages, makeScannedPreflight())
    expect(report.averageOcrConfidence).toBeCloseTo(0.8, 5)
  })
})
