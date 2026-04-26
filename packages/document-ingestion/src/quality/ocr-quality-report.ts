import type { CanonicalDocument, OcrQualityReport } from '../types'
import type { CanonicalPage, PdfPreflightResult } from '../types'

/**
 * Re-exports quality report builder for standalone use.
 * The canonical builder already uses this internally.
 * Exposed here for external testing and pipeline inspection.
 */
export function createOcrQualityReport(
  pages: CanonicalPage[],
  preflight: PdfPreflightResult,
): OcrQualityReport {
  const warnings: string[] = []

  if (pages.length === 0) {
    return {
      status: 'failed',
      totalPages: 0,
      failedPages: [],
      lowConfidencePages: [],
      averageOcrConfidence: null,
      documentType: preflight.documentType,
      requiresReview: false,
      warnings: ['No pages extracted'],
    }
  }

  const failedPages = pages
    .filter((p) => p.text.trim().length === 0)
    .map((p) => p.pageNumber)

  const emptyRatio = failedPages.length / pages.length
  if (emptyRatio > 0.2) {
    warnings.push(`${Math.round(emptyRatio * 100)}% of pages are empty`)
  }

  const confidenceValues = pages
    .map((p) => p.ocrConfidence)
    .filter((c): c is number => c !== null)

  const averageOcrConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      : null

  const lowConfidencePages = pages
    .filter((p) => p.ocrConfidence !== null && p.ocrConfidence < 0.75)
    .map((p) => p.pageNumber)

  if (lowConfidencePages.length > 0) {
    warnings.push(`Pages with OCR confidence < 0.75: ${lowConfidencePages.join(', ')}`)
  }

  if (preflight.documentType !== 'digital_pdf' && averageOcrConfidence === null) {
    warnings.push('Scanned/hybrid PDF has no OCR confidence data')
  }

  const allPagesFailed = pages.every((p) => p.text.trim().length === 0)

  let status: OcrQualityReport['status']

  if (allPagesFailed) {
    status = 'failed'
  } else if (
    lowConfidencePages.length > 0 ||
    (preflight.documentType !== 'digital_pdf' &&
      (averageOcrConfidence === null ||
        (averageOcrConfidence !== null && averageOcrConfidence < 0.85))) ||
    emptyRatio > 0.2
  ) {
    status = 'needs_review'
  } else {
    status = 'ready'
  }

  return {
    status,
    totalPages: pages.length,
    failedPages,
    lowConfidencePages,
    averageOcrConfidence,
    documentType: preflight.documentType,
    requiresReview: status === 'needs_review',
    warnings,
  }
}

/**
 * Convenience accessor to get a document's quality report for logging.
 * Never logs document content — only structural metadata.
 */
export function summarizeForLog(doc: CanonicalDocument): string {
  const { sourceHash, qualityReport } = doc
  return [
    `source_hash=${sourceHash.slice(0, 12)}...`,
    `pages=${qualityReport.totalPages}`,
    `status=${qualityReport.status}`,
    `failed_pages=${qualityReport.failedPages.length}`,
    qualityReport.warnings.length > 0 ? `warnings=${qualityReport.warnings.length}` : null,
  ]
    .filter(Boolean)
    .join(' | ')
}
