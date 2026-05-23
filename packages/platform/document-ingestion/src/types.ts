export type ParserProviderName = 'liteparse' | 'jats-xml'

export type DocumentType = 'digital_pdf' | 'scanned_pdf' | 'hybrid_pdf' | 'unknown'

export type IngestionStatus = 'ready' | 'needs_review' | 'failed'

export interface ParseInput {
  filePath?: string
  buffer?: Buffer
  fileName?: string
  mimeType?: string
  documentVersion?: string
  documentTitle?: string
}

export interface PdfPreflightResult {
  documentType: DocumentType
  requiresOcr: boolean
  confidence: number
  reason: string
  pageSignals: Array<{
    pageNumber: number
    hasExtractableText: boolean
    textDensity: number
  }>
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  text?: string
}

export interface CanonicalPage {
  pageNumber: number
  text: string
  markdown: string
  parserProvider: ParserProviderName
  ocrConfidence: number | null
  textDensity: number
  requiresReview: boolean
  boundingBoxes?: BoundingBox[]
}

export interface OcrQualityReport {
  status: IngestionStatus
  totalPages: number
  failedPages: number[]
  lowConfidencePages: number[]
  averageOcrConfidence: number | null
  documentType: DocumentType
  requiresReview: boolean
  warnings: string[]
}

export interface CanonicalDocument {
  documentId: string
  sourceHash: string
  documentVersion: string
  documentTitle?: string
  parserProvider: ParserProviderName
  createdAt: string
  preflight: PdfPreflightResult
  qualityReport: OcrQualityReport
  pages: CanonicalPage[]
  metadata: {
    fileName?: string
    mimeType?: string
    pageCount: number
  }
}

export interface ChunkerInput {
  content: string
  metadata: {
    source_hash: string
    page_number: number
    parser_provider: ParserProviderName
    ocr_confidence: number | null
    document_version: string
    document_title?: string
    ingestion_status: IngestionStatus
  }
}
