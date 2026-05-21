import type { QueryResult } from '@sentra/cermin'
import { describe, it, expect } from 'vitest'

import { validateEvidence, buildRegistryMap } from '../src/evaluation/evidence-validator'
import type { KnowledgeSourceRegistryEntry } from '../src/registry/registry-types'

function makeApprovedEntry(sourceHash: string): KnowledgeSourceRegistryEntry {
  return {
    source_hash: sourceHash,
    document_id: `doc-${sourceHash}`,
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
  }
}

function makeQueryResult(
  overrides: Partial<QueryResult & { metadata: Record<string, unknown> }> = {}
): QueryResult {
  return {
    id: 'kb:abc123:v1:p001:c0001',
    content: 'Clinical guideline text — not logged',
    score: 0.85,
    metadata: {
      source_hash: 'abc123',
      document_version: 'v1',
      page_number: 1,
      parser_provider: 'liteparse',
      ocr_confidence: 0.95,
      registry_status: 'approved_for_embedding',
    },
    ...overrides,
  }
}

describe('validateEvidence', () => {
  it('returns is_traceable=true and is_approved=true for fully compliant evidence', () => {
    const result = makeQueryResult()
    const registryMap = buildRegistryMap([makeApprovedEntry('abc123')])

    const evidence = validateEvidence(result, registryMap)

    expect(evidence.is_traceable).toBe(true)
    expect(evidence.is_approved).toBe(true)
    expect(evidence.traceability_issues).toHaveLength(0)
    expect(evidence.source_hash).toBe('abc123')
    expect(evidence.document_version).toBe('v1')
    expect(evidence.page_number).toBe(1)
    expect(evidence.vector_id).toBe('kb:abc123:v1:p001:c0001')
    expect(evidence.current_registry_status).toBe('approved_for_embedding')
  })

  it('flags missing source_hash as untraceable', () => {
    const result = makeQueryResult({
      metadata: {
        document_version: 'v1',
        page_number: 1,
        registry_status: 'approved_for_embedding',
      },
    })
    const registryMap = buildRegistryMap([])

    const evidence = validateEvidence(result, registryMap)

    expect(evidence.is_traceable).toBe(false)
    expect(evidence.traceability_issues).toContain('missing_source_hash')
  })

  it('flags missing document_version', () => {
    const result = makeQueryResult({
      metadata: {
        source_hash: 'abc123',
        page_number: 1,
        registry_status: 'approved_for_embedding',
      },
    })
    const registryMap = buildRegistryMap([makeApprovedEntry('abc123')])

    const evidence = validateEvidence(result, registryMap)
    expect(evidence.traceability_issues).toContain('missing_document_version')
  })

  it('flags missing page_number', () => {
    const result = makeQueryResult({
      metadata: {
        source_hash: 'abc123',
        document_version: 'v1',
        registry_status: 'approved_for_embedding',
      },
    })
    const registryMap = buildRegistryMap([makeApprovedEntry('abc123')])

    const evidence = validateEvidence(result, registryMap)
    expect(evidence.traceability_issues).toContain('missing_page_number')
  })

  it('flags source not in registry', () => {
    const result = makeQueryResult()
    const registryMap = buildRegistryMap([]) // empty registry

    const evidence = validateEvidence(result, registryMap)
    expect(evidence.is_approved).toBe(false)
    expect(evidence.traceability_issues).toContain('source_not_in_registry')
  })

  it('marks evidence as not approved when registry_status is ready_for_review', () => {
    const entry = {
      ...makeApprovedEntry('abc123'),
      registry_status: 'ready_for_review' as const,
    }
    const registryMap = buildRegistryMap([entry])
    const result = makeQueryResult()

    const evidence = validateEvidence(result, registryMap)

    expect(evidence.is_approved).toBe(false)
    expect(evidence.current_registry_status).toBe('ready_for_review')
  })

  it('marks evidence as not approved when registry_status is superseded', () => {
    const entry = {
      ...makeApprovedEntry('abc123'),
      registry_status: 'superseded' as const,
    }
    const registryMap = buildRegistryMap([entry])
    const result = makeQueryResult()

    const evidence = validateEvidence(result, registryMap)
    expect(evidence.is_approved).toBe(false)
  })
})

describe('buildRegistryMap', () => {
  it('builds a lookup map keyed by source_hash', () => {
    const entries = [makeApprovedEntry('hash1'), makeApprovedEntry('hash2')]
    const map = buildRegistryMap(entries)

    expect(map.size).toBe(2)
    expect(map.get('hash1')?.registry_status).toBe('approved_for_embedding')
    expect(map.get('hash2')?.registry_status).toBe('approved_for_embedding')
  })
})
