import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { isDuplicate } from '../src/ingestion/duplicate-detector'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dup-detector-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('isDuplicate', () => {
  it('returns false when processed/<hash> folder does not exist', () => {
    expect(isDuplicate(tmpDir, 'nonexistenthash')).toBe(false)
  })

  it('returns true when folder exists and force is undefined', () => {
    const hashDir = path.join(tmpDir, 'processed', 'abc123')
    fs.mkdirSync(hashDir, { recursive: true })

    expect(isDuplicate(tmpDir, 'abc123')).toBe(true)
  })

  it('returns true when folder exists and force is false', () => {
    const hashDir = path.join(tmpDir, 'processed', 'abc123')
    fs.mkdirSync(hashDir, { recursive: true })

    expect(isDuplicate(tmpDir, 'abc123', false)).toBe(true)
  })

  it('returns false when folder exists and force is true', () => {
    const hashDir = path.join(tmpDir, 'processed', 'abc123')
    fs.mkdirSync(hashDir, { recursive: true })

    expect(isDuplicate(tmpDir, 'abc123', true)).toBe(false)
  })

  it('returns false when sourceHash is empty string', () => {
    expect(isDuplicate(tmpDir, '')).toBe(false)
  })
})
