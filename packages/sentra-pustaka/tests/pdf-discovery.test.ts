import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { discoverPdfFiles } from '../src/ingestion/pdf-discovery'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-discovery-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function touch(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, '')
}

describe('discoverPdfFiles', () => {
  it('returns sorted array of PDF paths in flat directory', async () => {
    touch(path.join(tmpDir, 'c.pdf'))
    touch(path.join(tmpDir, 'a.pdf'))
    touch(path.join(tmpDir, 'b.pdf'))

    const results = await discoverPdfFiles(tmpDir)

    expect(results).toHaveLength(3)
    expect(results[0]).toContain('a.pdf')
    expect(results[1]).toContain('b.pdf')
    expect(results[2]).toContain('c.pdf')
  })

  it('finds PDFs nested in subdirectories (recursive)', async () => {
    touch(path.join(tmpDir, 'sub', 'nested', 'deep.pdf'))
    touch(path.join(tmpDir, 'root.pdf'))

    const results = await discoverPdfFiles(tmpDir)

    expect(results).toHaveLength(2)
    expect(results.some((p) => p.includes('deep.pdf'))).toBe(true)
    expect(results.some((p) => p.includes('root.pdf'))).toBe(true)
  })

  it('ignores non-PDF files', async () => {
    touch(path.join(tmpDir, 'document.pdf'))
    touch(path.join(tmpDir, 'notes.txt'))
    touch(path.join(tmpDir, 'report.docx'))

    const results = await discoverPdfFiles(tmpDir)

    expect(results).toHaveLength(1)
    expect(results[0]).toContain('document.pdf')
  })

  it('includes .PDF uppercase extension', async () => {
    touch(path.join(tmpDir, 'UPPER.PDF'))
    touch(path.join(tmpDir, 'lower.pdf'))

    const results = await discoverPdfFiles(tmpDir)

    expect(results).toHaveLength(2)
  })

  it('respects limit option', async () => {
    touch(path.join(tmpDir, 'a.pdf'))
    touch(path.join(tmpDir, 'b.pdf'))
    touch(path.join(tmpDir, 'c.pdf'))
    touch(path.join(tmpDir, 'd.pdf'))
    touch(path.join(tmpDir, 'e.pdf'))

    const results = await discoverPdfFiles(tmpDir, { limit: 2 })

    expect(results).toHaveLength(2)
    expect(results[0]).toContain('a.pdf')
    expect(results[1]).toContain('b.pdf')
  })

  it('returns empty array for empty directory', async () => {
    const results = await discoverPdfFiles(tmpDir)
    expect(results).toHaveLength(0)
  })

  it('throws for non-existent directory', async () => {
    await expect(discoverPdfFiles(path.join(tmpDir, 'nonexistent'))).rejects.toThrow(
      'Input directory not found'
    )
  })
})
