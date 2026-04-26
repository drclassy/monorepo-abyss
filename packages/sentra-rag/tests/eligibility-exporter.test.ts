import { describe, it, expect } from 'vitest'
import { createEligibleForEmbeddingExport } from '../src/registry/eligibility-exporter'
import type { KnowledgeRegistry, KnowledgeSourceRegistryEntry } from '../src/registry/registry-types'

function makeEntry(
  hash: string,
  registryStatus: KnowledgeSourceRegistryEntry['registry_status'],
  qualityStatus: KnowledgeSourceRegistryEntry['quality_status'] = 'ready',
  chunksPath?: string
): KnowledgeSourceRegistryEntry {
  return {
    source_hash: hash,
    document_id: `doc-${hash}`,
    document_version: '1.0',
    parser_provider: 'liteparse',
    page_count: 1,
    chunk_count: chunksPath ? 3 : 0,
    quality_status: qualityStatus,
    registry_status: registryStatus,
    created_at: new Date().toISOString(),
    registered_at: new Date().toISOString(),
    artifact_paths: { chunks_path: chunksPath },
    warnings: [],
  }
}

function makeRegistry(entries: KnowledgeSourceRegistryEntry[]): KnowledgeRegistry {
  return { schema_version: '1.0.0', updated_at: new Date().toISOString(), entries }
}

describe('createEligibleForEmbeddingExport', () => {
  it('includes only approved_for_embedding entries', () => {
    const registry = makeRegistry([
      makeEntry('approved', 'approved_for_embedding', 'ready', '/chunks.json'),
      makeEntry('review', 'ready_for_review', 'ready', '/chunks.json'),
      makeEntry('failed', 'failed', 'failed', undefined),
    ])

    const result = createEligibleForEmbeddingExport(registry)
    expect(result).toHaveLength(1)
    expect(result[0].source_hash).toBe('approved')
  })

  it('excludes approved entry without chunks_path', () => {
    const registry = makeRegistry([
      makeEntry('no-chunks', 'approved_for_embedding', 'ready', undefined),
    ])

    const result = createEligibleForEmbeddingExport(registry)
    expect(result).toHaveLength(0)
  })

  it('excludes approved entry with failed quality_status', () => {
    const registry = makeRegistry([
      makeEntry('bad-quality', 'approved_for_embedding', 'failed', '/chunks.json'),
    ])

    const result = createEligibleForEmbeddingExport(registry)
    expect(result).toHaveLength(0)
  })

  it('excludes superseded entries', () => {
    const registry = makeRegistry([
      makeEntry('superseded-doc', 'superseded', 'ready', '/chunks.json'),
    ])

    const result = createEligibleForEmbeddingExport(registry)
    expect(result).toHaveLength(0)
  })

  it('excludes archived entries', () => {
    const registry = makeRegistry([
      makeEntry('archived-doc', 'archived', 'ready', '/chunks.json'),
    ])

    const result = createEligibleForEmbeddingExport(registry)
    expect(result).toHaveLength(0)
  })

  it('returns empty array when registry has no eligible entries', () => {
    const registry = makeRegistry([
      makeEntry('needs-review', 'needs_review', 'needs_review', '/chunks.json'),
      makeEntry('failed', 'failed', 'failed', undefined),
    ])

    const result = createEligibleForEmbeddingExport(registry)
    expect(result).toHaveLength(0)
  })
})
