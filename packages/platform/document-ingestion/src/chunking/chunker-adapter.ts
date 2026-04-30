import type { CanonicalDocument, ChunkerInput } from '../types'

/**
 * Converts a CanonicalDocument into an array of ChunkerInput objects.
 *
 * Rules:
 * - Documents with status 'failed' return empty array (blocked from chunker).
 * - Empty pages are excluded.
 * - All required metadata is preserved on each chunk.
 * - No embedding is generated here.
 * - No vector DB write happens here.
 */
export function toChunkerInput(document: CanonicalDocument): ChunkerInput[] {
  if (document.qualityReport.status === 'failed') {
    return []
  }

  return document.pages
    .filter((page) => page.text.trim().length > 0)
    .map((page): ChunkerInput => ({
      content: page.text,
      metadata: {
        source_hash: document.sourceHash,
        page_number: page.pageNumber,
        parser_provider: page.parserProvider,
        ocr_confidence: page.ocrConfidence,
        document_version: document.documentVersion,
        document_title: document.documentTitle,
        ingestion_status: document.qualityReport.status,
      },
    }))
}
