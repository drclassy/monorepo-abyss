// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { RetrievedChunkCitationMetadata } from '../types.js'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function readString(metadata: Record<string, unknown>, key: string): string | undefined {
  const value = metadata[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function readNumber(metadata: Record<string, unknown>, key: string): number | null {
  const value = metadata[key]
  return typeof value === 'number' ? value : null
}

export function normalizeRetrievedChunkMetadata(metadata: unknown): Record<string, unknown> {
  return asRecord(metadata)
}

export function buildRetrievedChunkCitationMetadata(params: {
  metadata: unknown
  retrievalScore: number
  chunkIndex?: number
}): RetrievedChunkCitationMetadata {
  const metadata = normalizeRetrievedChunkMetadata(params.metadata)

  return {
    sourceHash: readString(metadata, 'source_hash'),
    pageNumber: readNumber(metadata, 'page_number'),
    chunkId: readString(metadata, 'chunk_id'),
    chunkIndex: params.chunkIndex,
    documentVersion: readString(metadata, 'document_version'),
    ocrConfidence: readNumber(metadata, 'ocr_confidence'),
    retrievalScore: params.retrievalScore,
  }
}
