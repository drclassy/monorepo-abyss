import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { readKnowledgeRegistry } from '../src/registry/registry-reader'
import type {
  KnowledgeRegistry,
  KnowledgeSourceRegistryEntry,
} from '../src/registry/registry-types'
import { writeKnowledgeRegistry } from '../src/registry/registry-writer'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function makeEntry(hash: string): KnowledgeSourceRegistryEntry {
  return {
    source_hash: hash,
    document_id: `doc-${hash}`,
    document_version: '1.0',
    parser_provider: 'liteparse',
    page_count: 1,
    chunk_count: 2,
    quality_status: 'ready',
    registry_status: 'ready_for_review',
    created_at: new Date().toISOString(),
    registered_at: new Date().toISOString(),
    artifact_paths: {},
    warnings: [],
  }
}

describe('readKnowledgeRegistry', () => {
  it('returns empty registry when file does not exist', async () => {
    const result = await readKnowledgeRegistry(tmpDir)
    expect(result.schema_version).toBe('1.0.0')
    expect(result.entries).toHaveLength(0)
  })

  it('reads and returns existing registry', async () => {
    const registry: KnowledgeRegistry = {
      schema_version: '1.0.0',
      updated_at: new Date().toISOString(),
      entries: [makeEntry('abc123')],
    }
    fs.writeFileSync(path.join(tmpDir, 'registry.json'), JSON.stringify(registry, null, 2))

    const result = await readKnowledgeRegistry(tmpDir)
    expect(result.entries).toHaveLength(1)
    expect(result.entries[0].source_hash).toBe('abc123')
  })

  it('returns empty registry on malformed JSON', async () => {
    fs.writeFileSync(path.join(tmpDir, 'registry.json'), 'not valid json')
    const result = await readKnowledgeRegistry(tmpDir)
    expect(result.entries).toHaveLength(0)
  })
})

describe('writeKnowledgeRegistry', () => {
  it('writes registry.json to registryDir', async () => {
    const registry: KnowledgeRegistry = {
      schema_version: '1.0.0',
      updated_at: new Date().toISOString(),
      entries: [makeEntry('hash1')],
    }

    const registryPath = await writeKnowledgeRegistry({ registryDir: tmpDir, registry })

    expect(fs.existsSync(registryPath)).toBe(true)
    const parsed = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
    expect(parsed.schema_version).toBe('1.0.0')
  })

  it('sorts entries deterministically by source_hash', async () => {
    const registry: KnowledgeRegistry = {
      schema_version: '1.0.0',
      updated_at: new Date().toISOString(),
      entries: [makeEntry('zzz'), makeEntry('aaa'), makeEntry('mmm')],
    }

    const registryPath = await writeKnowledgeRegistry({ registryDir: tmpDir, registry })
    const parsed: KnowledgeRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))

    expect(parsed.entries[0].source_hash).toBe('aaa')
    expect(parsed.entries[1].source_hash).toBe('mmm')
    expect(parsed.entries[2].source_hash).toBe('zzz')
  })

  it('creates registryDir if it does not exist', async () => {
    const nestedDir = path.join(tmpDir, 'nested', 'deep')
    const registry: KnowledgeRegistry = {
      schema_version: '1.0.0',
      updated_at: new Date().toISOString(),
      entries: [],
    }

    await writeKnowledgeRegistry({ registryDir: nestedDir, registry })
    expect(fs.existsSync(path.join(nestedDir, 'registry.json'))).toBe(true)
  })
})
