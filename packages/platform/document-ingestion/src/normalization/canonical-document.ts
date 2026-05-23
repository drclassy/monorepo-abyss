import type {
  CanonicalDocument,
  CanonicalPage,
  OcrQualityReport,
  PdfPreflightResult,
  ParserProviderName,
} from '../types'

interface BuildInput {
  sourceHash: string
  pages: CanonicalPage[]
  preflight: PdfPreflightResult
  fileName?: string
  mimeType?: string
  documentVersion: string
  documentTitle?: string
}

export function buildCanonicalDocument(input: BuildInput): CanonicalDocument {
  const { sourceHash, pages, preflight, fileName, mimeType, documentVersion, documentTitle } = input

  const documentId = `doc_${sourceHash.slice(0, 16)}_${documentVersion}`
  const provider: ParserProviderName = 'liteparse'

  const qualityReport = buildQualityReport(pages, preflight)

  return {
    documentId,
    sourceHash,
    documentVersion,
    documentTitle,
    parserProvider: provider,
    createdAt: new Date().toISOString(),
    preflight,
    qualityReport,
    pages,
    metadata: {
      fileName,
      mimeType,
      pageCount: pages.length,
    },
  }
}

function buildQualityReport(
  pages: CanonicalPage[],
  preflight: PdfPreflightResult
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
      warnings: ['No pages extracted — document parse failed'],
    }
  }

  const failedPages = pages.filter((p) => p.text.trim().length === 0).map((p) => p.pageNumber)

  const emptyRatio = failedPages.length / pages.length
  if (emptyRatio > 0.2) {
    warnings.push(
      `${Math.round(emptyRatio * 100)}% of pages are empty (${failedPages.length}/${pages.length})`
    )
  }

  const confidenceValues = pages.map((p) => p.ocrConfidence).filter((c): c is number => c !== null)

  const averageOcrConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      : null

  const lowConfidencePages = pages
    .filter((p) => p.ocrConfidence !== null && p.ocrConfidence < 0.75)
    .map((p) => p.pageNumber)

  if (lowConfidencePages.length > 0) {
    warnings.push(
      `${lowConfidencePages.length} page(s) have OCR confidence < 0.75: pages ${lowConfidencePages.join(', ')}`
    )
  }

  // Scanned PDF missing OCR confidence = degraded signal
  if (preflight.documentType !== 'digital_pdf' && averageOcrConfidence === null) {
    warnings.push('Scanned/hybrid PDF has no OCR confidence data — results may be unreliable')
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
