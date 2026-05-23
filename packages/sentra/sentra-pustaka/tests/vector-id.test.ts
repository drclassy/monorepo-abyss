import { describe, it, expect } from 'vitest'

import { buildVectorId, buildChunkId, buildContentHash } from '../src/embedding/vector-id'

describe('buildVectorId', () => {
  it('produces stable, deterministic IDs', () => {
    const id1 = buildVectorId('abc123', 'v1', 1, 0)
    const id2 = buildVectorId('abc123', 'v1', 1, 0)
    expect(id1).toBe(id2)
  })

  it('follows the kb:<hash>:<version>:p<page>:c<chunk> shape', () => {
    const id = buildVectorId('abc123', 'v1', 1, 0)
    expect(id).toBe('kb:abc123:v1:p001:c0001')
  })

  it('pads page number to 3 digits', () => {
    expect(buildVectorId('h', 'v1', 5, 0)).toContain(':p005:')
    expect(buildVectorId('h', 'v1', 100, 0)).toContain(':p100:')
  })

  it('pads chunk index (1-based) to 4 digits', () => {
    expect(buildVectorId('h', 'v1', 1, 0)).toContain(':c0001')
    expect(buildVectorId('h', 'v1', 1, 9)).toContain(':c0010')
  })

  it('different document_version produces different vector IDs', () => {
    const id1 = buildVectorId('abc123', 'v1', 1, 0)
    const id2 = buildVectorId('abc123', 'v2', 1, 0)
    expect(id1).not.toBe(id2)
  })

  it('prepends v if version does not start with v', () => {
    const id = buildVectorId('abc123', '1', 1, 0)
    expect(id).toContain(':v1:')
  })

  it('does not double-prepend v if version already starts with v', () => {
    const id = buildVectorId('abc123', 'v1', 1, 0)
    expect(id).not.toContain(':vv1:')
  })
})

describe('buildChunkId', () => {
  it('produces the correct shape', () => {
    expect(buildChunkId('abc123', 1, 0)).toBe('abc123:p001:c0001')
  })
})

describe('buildContentHash', () => {
  it('returns a 16-char hex string', () => {
    const hash = buildContentHash('some medical text')
    expect(hash).toHaveLength(16)
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })

  it('is stable for identical content', () => {
    expect(buildContentHash('text')).toBe(buildContentHash('text'))
  })

  it('differs for different content', () => {
    expect(buildContentHash('text a')).not.toBe(buildContentHash('text b'))
  })
})
