import { describe, it, expect } from 'vitest'

import { buildRegistrySummary } from '../src/registry/registry-summary'
import { mapQualityToRegistryStatus } from '../src/registry/registry-types'
import type {
  KnowledgeRegistry,
  KnowledgeSourceRegistryEntry,
} from '../src/registry/registry-types'

function makeEntry(
  hash: string,
  status: KnowledgeSourceRegistryEntry['registry_status']
): KnowledgeSourceRegistryEntry {
  return {
    source_hash: hash,
    document_id: `doc-${hash}`,
    document_version: '1.0',
    parser_provider: 'liteparse',
    page_count: 1,
    chunk_count: 1,
    quality_status: 'ready',
    registry_status: status,
    created_at: new Date().toISOString(),
    registered_at: new Date().toISOString(),
    artifact_paths: {},
    warnings: [],
  }
}

function makeRegistry(entries: KnowledgeSourceRegistryEntry[]): KnowledgeRegistry {
  return { schema_version: '1.0.0', updated_at: new Date().toISOString(), entries }
}

describe('buildRegistrySummary', () => {
  it('counts statuses correctly', () => {
    const registry = makeRegistry([
      makeEntry('a', 'ready_for_review'),
      makeEntry('b', 'ready_for_review'),
      makeEntry('c', 'approved_for_embedding'),
      makeEntry('d', 'needs_review'),
      makeEntry('e', 'failed'),
      makeEntry('f', 'superseded'),
    ])

    const summary = buildRegistrySummary(registry, new Date().toISOString())

    expect(summary.total_entries).toBe(6)
    expect(summary.ready_for_review_count).toBe(2)
    expect(summary.approved_for_embedding_count).toBe(1)
    expect(summary.needs_review_count).toBe(1)
    expect(summary.failed_count).toBe(1)
    expect(summary.superseded_count).toBe(1)
    expect(summary.archived_count).toBe(0)
  })

  it('has valid ISO timestamps', () => {
    const registry = makeRegistry([])
    const startedAt = new Date().toISOString()
    const summary = buildRegistrySummary(registry, startedAt)

    expect(new Date(summary.started_at).toISOString()).toBe(summary.started_at)
    expect(new Date(summary.completed_at).toISOString()).toBe(summary.completed_at)
  })
})

describe('mapQualityToRegistryStatus', () => {
  it('maps ready to ready_for_review', () => {
    expect(mapQualityToRegistryStatus('ready')).toBe('ready_for_review')
  })

  it('maps needs_review to needs_review', () => {
    expect(mapQualityToRegistryStatus('needs_review')).toBe('needs_review')
  })

  it('maps failed to failed', () => {
    expect(mapQualityToRegistryStatus('failed')).toBe('failed')
  })
})
