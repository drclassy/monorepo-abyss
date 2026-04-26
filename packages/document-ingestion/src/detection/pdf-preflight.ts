import type { CanonicalPage, DocumentType, PdfPreflightResult } from '../types'

const SCANNED_DENSITY_THRESHOLD = 20
const DIGITAL_RATIO_THRESHOLD = 0.7
const SCANNED_RATIO_THRESHOLD = 0.3

/**
 * Classifies a PDF as digital, scanned, hybrid, or unknown based on page-level
 * text signals from a non-OCR parse pass.
 *
 * Thresholds (adjustable after real document testing):
 *   text_density < 20 chars/page  → likely scanned
 *   >= 70% pages extractable      → digital_pdf
 *   <= 30% pages extractable      → scanned_pdf
 *   otherwise                     → hybrid_pdf
 */
export function detectPdfPreflight(pages: CanonicalPage[]): PdfPreflightResult {
  if (pages.length === 0) {
    return {
      documentType: 'unknown',
      requiresOcr: true,
      confidence: 0,
      reason: 'No pages returned from preflight parse',
      pageSignals: [],
    }
  }

  const pageSignals = pages.map((p) => ({
    pageNumber: p.pageNumber,
    hasExtractableText: p.textDensity >= SCANNED_DENSITY_THRESHOLD,
    textDensity: p.textDensity,
  }))

  const extractableCount = pageSignals.filter((s) => s.hasExtractableText).length
  const ratio = extractableCount / pageSignals.length

  let documentType: DocumentType
  let requiresOcr: boolean
  let confidence: number
  let reason: string

  if (ratio >= DIGITAL_RATIO_THRESHOLD) {
    documentType = 'digital_pdf'
    requiresOcr = false
    confidence = ratio
    reason = `${Math.round(ratio * 100)}% of pages have extractable text`
  } else if (ratio <= SCANNED_RATIO_THRESHOLD) {
    documentType = 'scanned_pdf'
    requiresOcr = true
    confidence = 1 - ratio
    reason = `Only ${Math.round(ratio * 100)}% of pages have extractable text — likely scanned`
  } else {
    documentType = 'hybrid_pdf'
    requiresOcr = true
    confidence = 0.5
    reason = `Mixed extractability (${Math.round(ratio * 100)}% extractable) — hybrid document`
  }

  return { documentType, requiresOcr, confidence, reason, pageSignals }
}
