import type { QueryResult } from '@the-abyss/vector-store'
import type { KnowledgeSourceRegistryEntry } from '../registry/registry-types.js'
import type { EvidenceRecord } from './types.js'

/**
 * Validates a single retrieved chunk for traceability and approval status.
 *
 * Traceability requires:
 *   - source_hash in metadata
 *   - document_version in metadata
 *   - page_number in metadata
 *   - vector_id (= result.id for upsertById-written records)
 *
 * Approval requires:
 *   - Current registry status === 'approved_for_embedding'
 *   - (Cross-checked against live registry, not just stored metadata)
 */
export function validateEvidence(
  result: QueryResult,
  registryByHash: Map<string, KnowledgeSourceRegistryEntry>,
): EvidenceRecord {
  const meta = result.metadata as Record<string, unknown>

  const sourceHash = typeof meta['source_hash'] === 'string' ? meta['source_hash'] : null
  const documentVersion =
    typeof meta['document_version'] === 'string' ? meta['document_version'] : null
  const pageNumber = typeof meta['page_number'] === 'number' ? meta['page_number'] : null
  const parserProvider =
    typeof meta['parser_provider'] === 'string' ? meta['parser_provider'] : null
  const ocrConfidence =
    typeof meta['ocr_confidence'] === 'number' ? meta['ocr_confidence'] : null
  const registryStatusAtWrite =
    typeof meta['registry_status'] === 'string' ? meta['registry_status'] : null

  const traceabilityIssues: string[] = []
  if (!sourceHash) traceabilityIssues.push('missing_source_hash')
  if (!documentVersion) traceabilityIssues.push('missing_document_version')
  if (pageNumber === null) traceabilityIssues.push('missing_page_number')
  if (!result.id) traceabilityIssues.push('missing_vector_id')

  const isTraceable = traceabilityIssues.length === 0

  // Cross-check current registry status
  let currentRegistryStatus: string | null = null
  let isApproved = false

  if (sourceHash) {
    const registryEntry = registryByHash.get(sourceHash)
    if (registryEntry) {
      currentRegistryStatus = registryEntry.registry_status
      isApproved = registryEntry.registry_status === 'approved_for_embedding'
    } else {
      traceabilityIssues.push('source_not_in_registry')
    }
  }

  return {
    vector_id: result.id,
    source_hash: sourceHash,
    document_version: documentVersion,
    page_number: pageNumber,
    parser_provider: parserProvider,
    ocr_confidence: ocrConfidence,
    registry_status_at_write: registryStatusAtWrite,
    current_registry_status: currentRegistryStatus,
    similarity_score: result.score,
    is_traceable: isTraceable,
    is_approved: isApproved,
    traceability_issues: traceabilityIssues,
  }
}

/**
 * Builds a registry lookup map from an array of entries.
 */
export function buildRegistryMap(
  entries: KnowledgeSourceRegistryEntry[],
): Map<string, KnowledgeSourceRegistryEntry> {
  const map = new Map<string, KnowledgeSourceRegistryEntry>()
  for (const entry of entries) {
    map.set(entry.source_hash, entry)
  }
  return map
}
