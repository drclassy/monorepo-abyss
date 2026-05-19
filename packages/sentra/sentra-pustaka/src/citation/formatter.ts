// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { GroundedCitation, RetrievedChunk } from '../types.js'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function readString(metadata: Record<string, unknown>, key: string): string | undefined {
  const value = metadata[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function readNumber(metadata: Record<string, unknown>, key: string): number | undefined {
  const value = metadata[key]
  return typeof value === 'number' ? value : undefined
}

function buildTextSpan(
  metadata: Record<string, unknown>
): { start?: number; end?: number } | undefined {
  const start = readNumber(metadata, 'text_span_start')
  const end = readNumber(metadata, 'text_span_end')

  return start === undefined && end === undefined ? undefined : { start, end }
}

function buildTraceabilityIssues(params: {
  sourceHash?: string
  documentId?: string
  documentVersion?: string
  sourceTitle?: string
  parserProvider?: string
  chunkId?: string
  vectorId?: string
  pageNumber: number | null
  chunkIndex?: number
  ocrConfidence: number | null
  retrievalScore: number
  contentPreview: string
}): string[] {
  const issues: string[] = []

  if (!params.sourceHash) issues.push('missing_source_hash')
  if (!params.documentId) issues.push('missing_document_id')
  if (!params.documentVersion) issues.push('missing_document_version')
  if (!params.sourceTitle) issues.push('missing_source_title')
  if (!params.parserProvider) issues.push('missing_parser_provider')
  if (!params.chunkId) issues.push('missing_chunk_id')
  if (!params.vectorId) issues.push('missing_vector_id')
  if (params.pageNumber === null) issues.push('missing_page_number')
  if (params.chunkIndex === undefined) issues.push('missing_chunk_index')
  if (params.ocrConfidence === null) issues.push('missing_ocr_confidence')
  if (!Number.isFinite(params.retrievalScore)) issues.push('invalid_retrieval_score')
  if (params.contentPreview.length === 0) issues.push('missing_content_preview')

  return issues
}

export function formatGroundedCitations(chunks: RetrievedChunk[]): GroundedCitation[] {
  return chunks.map((chunk, index) => {
    const metadata = asRecord(chunk.metadata)
    const citationMetadata = chunk.citationMetadata

    const sourceHash = citationMetadata?.sourceHash ?? readString(metadata, 'source_hash')
    const documentId = readString(metadata, 'document_id')
    const documentVersion =
      citationMetadata?.documentVersion ?? readString(metadata, 'document_version')
    const sourceTitle = readString(metadata, 'document_title')
    const parserProvider = readString(metadata, 'parser_provider')
    const chunkId = citationMetadata?.chunkId ?? readString(metadata, 'chunk_id')
    const vectorId =
      readString(metadata, 'vector_id') ?? (chunk.id.length > 0 ? chunk.id : undefined)
    const pageNumber = citationMetadata?.pageNumber ?? readNumber(metadata, 'page_number') ?? null
    const chunkIndex = citationMetadata?.chunkIndex ?? chunk.chunkIndex
    const ocrConfidence =
      citationMetadata?.ocrConfidence ?? readNumber(metadata, 'ocr_confidence') ?? null
    const retrievalScore = citationMetadata?.retrievalScore ?? chunk.similarity
    const contentPreview = chunk.content
    const traceabilityIssues = buildTraceabilityIssues({
      sourceHash,
      documentId,
      documentVersion,
      sourceTitle,
      parserProvider,
      chunkId,
      vectorId,
      pageNumber,
      chunkIndex,
      ocrConfidence,
      retrievalScore,
      contentPreview,
    })

    return {
      citationLabel: `[${index + 1}]`,
      source: {
        sourceHash: sourceHash ?? '',
        ...(documentId ? { documentId } : {}),
        ...(documentVersion ? { documentVersion } : {}),
        ...(sourceTitle ? { sourceTitle } : {}),
        ...(parserProvider ? { parserProvider } : {}),
      },
      evidence: {
        ...(chunkId ? { chunkId } : {}),
        ...(vectorId ? { vectorId } : {}),
        pageNumber,
        ...(chunkIndex !== undefined ? { chunkIndex } : {}),
        ...(buildTextSpan(metadata) ? { textSpan: buildTextSpan(metadata) } : {}),
        ocrConfidence,
        retrievalScore,
        contentPreview,
        traceabilityIssues,
      },
    }
  })
}
