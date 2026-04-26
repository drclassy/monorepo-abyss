import { createHash } from 'node:crypto'

/**
 * Generates a deterministic SHA-256 hex fingerprint for a document buffer.
 * Same file always returns the same hash.
 * Used for deduplication before parsing and before embedding.
 */
export function createSourceHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}
