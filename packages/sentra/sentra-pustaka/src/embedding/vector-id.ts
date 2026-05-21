// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { createHash } from 'crypto'

/**
 * Builds a stable, idempotent vector ID for a chunk.
 *
 * Shape: kb:<source_hash>:<document_version>:p<page_padded3>:c<chunk_padded4>
 * Example: kb:abc123:v1:p001:c0001
 *
 * Rules:
 * - Same chunk always produces the same vector ID.
 * - Different document_version produces a different ID.
 * - chunkIndex is 0-based; the encoded form is 1-based padded to 4 digits.
 */
export function buildVectorId(
  sourceHash: string,
  documentVersion: string,
  pageNumber: number,
  chunkIndex: number
): string {
  const versionTag = documentVersion.startsWith('v') ? documentVersion : `v${documentVersion}`
  const pageTag = String(pageNumber).padStart(3, '0')
  const chunkTag = String(chunkIndex + 1).padStart(4, '0')
  return `kb:${sourceHash}:${versionTag}:p${pageTag}:c${chunkTag}`
}

/**
 * Builds a chunk_id from source_hash, page_number, and chunk index.
 * Used in embedded-chunks.jsonl as a logical chunk identifier.
 *
 * Shape: <source_hash>:p<page_padded3>:c<chunk_padded4>
 */
export function buildChunkId(sourceHash: string, pageNumber: number, chunkIndex: number): string {
  const pageTag = String(pageNumber).padStart(3, '0')
  const chunkTag = String(chunkIndex + 1).padStart(4, '0')
  return `${sourceHash}:p${pageTag}:c${chunkTag}`
}

/**
 * Computes a short SHA-256 content hash (first 16 hex chars) for a chunk.
 * Used for idempotency detection on repeat runs.
 */
export function buildContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex').slice(0, 16)
}
