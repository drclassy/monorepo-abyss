import { describe, it, expect } from 'vitest'
import { markSuperseded } from '../src/registry/supersession'
import { createEligibleForEmbeddingExport } from '../src/registry/eligibility-exporter'
import type { KnowledgeRegistry, KnowledgeSourceRegistryEntry } from '../src/registry/registry-types'

function makeEntry(
  hash: string,
  status: KnowledgeSourceRegistryEntry['registry_status'] = 'approved_for_embedding',
  chunksPath = '/chunks.json'
): KnowledgeSourceRegistryEntry {
  return {
    source_hash: hash,
    document_id: `doc-${hash}`,
    document_version: '1.0',
    parser_provider: 'liteparse',
    page_count: 1,
    chunk_count: 2,
    quality_status: 'ready',
    registry_status: status,
    created_at: new Date().toISOString(),
    registered_at: new Date().toISOString(),
    artifact_paths: { chunks_path: chunksPath },
    warnings: [],
  }
}

function makeRegistry(entries: KnowledgeSourceRegistryEntry[]): KnowledgeRegistry {
  return { schema_version: '1.0.0', updated_at: new Date().toISOString(), entries }
}

describe('markSuperseded', () => {
  it('marks old document as superseded', () => {
    const registry = makeRegistry([makeEntry('old-hash'), makeEntry('new-hash')])
    const updated = markSuperseded({ registry, oldSourceHash: 'old-hash', newSourceHash: 'new-hash' })

    const old = updated.entries.find((e) => e.source_hash === 'old-hash')!
    expect(old.registry_status).toBe('superseded')
    expect(old.superseded_by).toBe('new-hash')
  })

  it('links new document with supersedes containing old hash', () => {
    const registry = makeRegistry([makeEntry('old-hash'), makeEntry('new-hash')])
    const updated = markSuperseded({ registry, oldSourceHash: 'old-hash', newSourceHash: 'new-hash' })

    const newDoc = updated.entries.find((e) => e.source_hash === 'new-hash')!
    expect(newDoc.supersedes).toContain('old-hash')
  })

  it('does not duplicate supersedes when called twice for same pair', () => {
    const registry = makeRegistry([makeEntry('old'), makeEntry('new')])
    const once = markSuperseded({ registry, oldSourceHash: 'old', newSourceHash: 'new' })
    const twice = markSuperseded({ registry: once, oldSourceHash: 'old', newSourceHash: 'new' })

    const newDoc = twice.entries.find((e) => e.source_hash === 'new')!
    const oldCount = newDoc.supersedes?.filter((h) => h === 'old').length ?? 0
    expect(oldCount).toBe(1)
  })

  it('excludes old document from eligibility export after supersession', () => {
    const registry = makeRegistry([makeEntry('old'), makeEntry('new')])
    const updated = markSuperseded({ registry, oldSourceHash: 'old', newSourceHash: 'new' })

    const eligible = createEligibleForEmbeddingExport(updated)
    const hashes = eligible.map((e) => e.source_hash)
    expect(hashes).not.toContain('old')
    expect(hashes).toContain('new')
  })
})
