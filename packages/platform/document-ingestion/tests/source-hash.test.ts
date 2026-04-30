import { describe, it, expect } from 'vitest'
import { createSourceHash } from '../src/hashing/source-hash'

describe('createSourceHash', () => {
  it('returns a 64-character lowercase hex string', () => {
    const hash = createSourceHash(Buffer.from('hello'))
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('same buffer always returns the same hash', () => {
    const buf = Buffer.from('deterministic content')
    expect(createSourceHash(buf)).toBe(createSourceHash(buf))
  })

  it('different buffers return different hashes', () => {
    const a = createSourceHash(Buffer.from('aaa'))
    const b = createSourceHash(Buffer.from('bbb'))
    expect(a).not.toBe(b)
  })

  it('is deterministic across calls with same content', () => {
    const buf1 = Buffer.from('same content')
    const buf2 = Buffer.from('same content')
    expect(createSourceHash(buf1)).toBe(createSourceHash(buf2))
  })
})
