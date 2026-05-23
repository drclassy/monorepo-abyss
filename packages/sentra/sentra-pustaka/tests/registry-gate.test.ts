import fs from 'fs'
import os from 'os'
import path from 'path'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { loadApprovedCandidates } from '../src/embedding/registry-gate'
import type { KnowledgeRegistry } from '../src/registry/registry-types'

function makeRegistry(entries: KnowledgeRegistry['entries']): KnowledgeRegistry {
  return {
    schema_version: '1.0.0',
    updated_at: new Date().toISOString(),
    entries,
  }
}

describe('loadApprovedCandidates', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-gate-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('returns empty arrays when registry.json is missing', () => {
    const result = loadApprovedCandidates(tmpDir)
    expect(result.approved).toHaveLength(0)
    expect(result.skipped).toHaveLength(0)
  })

  it('returns only approved_for_embedding from registry when no eligible file', () => {
    const registry = makeRegistry([
      {
        source_hash: 'approved1',
        document_id: 'doc-1',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 2,
        chunk_count: 4,
        quality_status: 'ready',
        registry_status: 'approved_for_embedding',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
      {
        source_hash: 'review1',
        document_id: 'doc-2',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 2,
        quality_status: 'needs_review',
        registry_status: 'ready_for_review',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
    ])
    fs.writeFileSync(path.join(tmpDir, 'registry.json'), JSON.stringify(registry), 'utf-8')

    const result = loadApprovedCandidates(tmpDir)
    expect(result.approved).toHaveLength(1)
    expect(result.approved[0].source_hash).toBe('approved1')
    expect(result.skipped).toHaveLength(0)
  })

  it('skips candidates not in registry (candidate_missing_from_registry)', () => {
    const registry = makeRegistry([])
    fs.writeFileSync(path.join(tmpDir, 'registry.json'), JSON.stringify(registry), 'utf-8')

    const eligible = [{ source_hash: 'ghost-hash', registry_status: 'approved_for_embedding' }]
    fs.writeFileSync(
      path.join(tmpDir, 'eligible-for-embedding.json'),
      JSON.stringify(eligible),
      'utf-8'
    )

    const result = loadApprovedCandidates(tmpDir)
    expect(result.approved).toHaveLength(0)
    expect(result.skipped[0].reason).toBe('candidate_missing_from_registry')
  })

  it('skips candidates with non-approved registry status', () => {
    const registry = makeRegistry([
      {
        source_hash: 'hash1',
        document_id: 'doc-1',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 1,
        quality_status: 'needs_review',
        registry_status: 'ready_for_review',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
    ])
    fs.writeFileSync(path.join(tmpDir, 'registry.json'), JSON.stringify(registry), 'utf-8')

    const eligible = [{ source_hash: 'hash1', registry_status: 'ready_for_review' }]
    fs.writeFileSync(
      path.join(tmpDir, 'eligible-for-embedding.json'),
      JSON.stringify(eligible),
      'utf-8'
    )

    const result = loadApprovedCandidates(tmpDir)
    expect(result.approved).toHaveLength(0)
    expect(result.skipped[0].reason).toBe('status_not_approved_for_embedding')
  })

  it('approves only candidates with approved_for_embedding status', () => {
    const registry = makeRegistry([
      {
        source_hash: 'approved1',
        document_id: 'doc-1',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 2,
        quality_status: 'ready',
        registry_status: 'approved_for_embedding',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
      {
        source_hash: 'needs_review1',
        document_id: 'doc-2',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 1,
        quality_status: 'needs_review',
        registry_status: 'needs_review',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
    ])
    fs.writeFileSync(path.join(tmpDir, 'registry.json'), JSON.stringify(registry), 'utf-8')

    const eligible = [
      { source_hash: 'approved1', registry_status: 'approved_for_embedding' },
      { source_hash: 'needs_review1', registry_status: 'needs_review' },
    ]
    fs.writeFileSync(
      path.join(tmpDir, 'eligible-for-embedding.json'),
      JSON.stringify(eligible),
      'utf-8'
    )

    const result = loadApprovedCandidates(tmpDir)
    expect(result.approved).toHaveLength(1)
    expect(result.approved[0].source_hash).toBe('approved1')
    expect(result.skipped).toHaveLength(1)
    expect(result.skipped[0].source_hash).toBe('needs_review1')
  })

  it('does not auto-approve any document', () => {
    const registry = makeRegistry([
      {
        source_hash: 'pending1',
        document_id: 'doc-p',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 1,
        quality_status: 'ready',
        registry_status: 'ready_for_review',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
    ])
    fs.writeFileSync(path.join(tmpDir, 'registry.json'), JSON.stringify(registry), 'utf-8')

    const result = loadApprovedCandidates(tmpDir)
    expect(result.approved.every((e) => e.registry_status === 'approved_for_embedding')).toBe(true)
  })
})
