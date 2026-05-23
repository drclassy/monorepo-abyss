// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { EmbeddedChunkRecord } from '../embedding/types.js'
import { buildChunkId, buildContentHash, buildVectorId } from '../embedding/vector-id.js'
import type { KnowledgeSourceRegistryEntry } from '../registry/registry-types.js'

export interface PdfKnowledgeChunk {
  content: string
  metadata: {
    source_hash: string
    page_number?: number
    parser_provider?: string
    ocr_confidence?: number | null
    document_version?: string
    document_title?: string
    ingestion_status?: string
  }
}

export interface PdfKnowledgeDatabaseRecord {
  vectorId: string
  chunkId: string
  content: string
  metadata: Record<string, unknown>
  embeddedChunk: EmbeddedChunkRecord
}

export interface BuildPdfKnowledgeDatabaseRecordParams {
  source: KnowledgeSourceRegistryEntry
  chunk: PdfKnowledgeChunk
  chunkIndex: number
  embeddingModel: string
  embeddingDimensions: number
  embeddedAt?: string
}

/**
 * Converts a parsed PDF chunk into the database/vector knowledge record shape.
 *
 * This is the boundary between PDF ingestion artifacts and Knowledge Agent
 * storage. It does not parse PDFs, generate embeddings, or write to a database.
 */
export function buildPdfKnowledgeDatabaseRecord(
  params: BuildPdfKnowledgeDatabaseRecordParams
): PdfKnowledgeDatabaseRecord {
  const { source, chunk, chunkIndex, embeddingModel, embeddingDimensions } = params
  const sourceHash = source.source_hash
  const documentVersion = source.document_version
  const pageNumber = chunk.metadata.page_number ?? 0
  const parserProvider = chunk.metadata.parser_provider ?? source.parser_provider
  const ocrConfidence = chunk.metadata.ocr_confidence ?? null
  const chunkId = buildChunkId(sourceHash, pageNumber, chunkIndex)
  const vectorId = buildVectorId(sourceHash, documentVersion, pageNumber, chunkIndex)
  const contentHash = buildContentHash(chunk.content)
  const embeddedAt = params.embeddedAt ?? new Date().toISOString()

  const metadata: Record<string, unknown> = {
    source_hash: sourceHash,
    document_id: source.document_id,
    document_version: documentVersion,
    document_title: source.document_title ?? chunk.metadata.document_title ?? undefined,
    document_type: source.document_type,
    chunk_id: chunkId,
    vector_id: vectorId,
    page_number: pageNumber,
    parser_provider: parserProvider,
    ocr_confidence: ocrConfidence,
    registry_status: 'approved_for_embedding',
    approval_status: source.registry_status,
    ingestion_status: chunk.metadata.ingestion_status ?? source.quality_status,
    content_hash: contentHash,
  }

  const embeddedChunk: EmbeddedChunkRecord = {
    source_hash: sourceHash,
    document_version: documentVersion,
    chunk_id: chunkId,
    vector_id: vectorId,
    page_number: pageNumber,
    parser_provider: parserProvider,
    ocr_confidence: ocrConfidence,
    registry_status: 'approved_for_embedding',
    embedding_model: embeddingModel,
    embedding_dimension: embeddingDimensions,
    content_hash: contentHash,
    embedded_at: embeddedAt,
  }

  return {
    vectorId,
    chunkId,
    content: chunk.content,
    metadata,
    embeddedChunk,
  }
}
