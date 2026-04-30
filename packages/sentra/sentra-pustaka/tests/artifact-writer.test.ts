import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { writeKnowledgeArtifacts } from '../src/ingestion/artifact-writer'
import type { CanonicalDocument } from '@the-abyss/document-ingestion'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'artifact-writer-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function makeCanonical(status: 'ready' | 'needs_review' | 'failed'): CanonicalDocument {
  return {
    documentId: 'doc-123',
    sourceHash: 'abc123hash',
    documentVersion: '1.0',
    documentTitle: 'Test Doc',
    parserProvider: 'liteparse',
    createdAt: new Date().toISOString(),
    preflight: {
      documentType: 'digital_pdf',
      requiresOcr: false,
      confidence: 0.9,
      reason: 'test',
      pageSignals: [],
    },
    qualityReport: {
      status,
      totalPages: 1,
      failedPages: [],
      lowConfidencePages: [],
      averageOcrConfidence: null,
      documentType: 'digital_pdf',
      requiresReview: false,
      warnings: [],
    },
    pages: [],
    metadata: { pageCount: 1 },
  }
}

describe('writeKnowledgeArtifacts', () => {
  it('writes all four files when status is ready', async () => {
    const canonical = makeCanonical('ready')
    const result = await writeKnowledgeArtifacts({
      outputDir: tmpDir,
      canonical,
      markdown: '# Test',
      chunks: [],
    })

    expect(fs.existsSync(result.canonicalPath)).toBe(true)
    expect(fs.existsSync(result.markdownPath)).toBe(true)
    expect(fs.existsSync(result.qualityReportPath)).toBe(true)
    expect(result.chunksPath).toBeDefined()
    expect(fs.existsSync(result.chunksPath!)).toBe(true)
  })

  it('writes chunks.json when status is needs_review', async () => {
    const canonical = makeCanonical('needs_review')
    const result = await writeKnowledgeArtifacts({
      outputDir: tmpDir,
      canonical,
      markdown: '# Test',
      chunks: [],
    })

    expect(result.chunksPath).toBeDefined()
    expect(fs.existsSync(result.chunksPath!)).toBe(true)
  })

  it('does NOT write chunks.json when status is failed', async () => {
    const canonical = makeCanonical('failed')
    const result = await writeKnowledgeArtifacts({
      outputDir: tmpDir,
      canonical,
      markdown: '# Test',
      chunks: [],
    })

    expect(result.chunksPath).toBeUndefined()
  })

  it('creates output directory recursively if it does not exist', async () => {
    const canonical = makeCanonical('ready')
    const nestedOutputDir = path.join(tmpDir, 'nested', 'deep', 'output')

    const result = await writeKnowledgeArtifacts({
      outputDir: nestedOutputDir,
      canonical,
      markdown: '# Test',
      chunks: [],
    })

    expect(fs.existsSync(result.artifactDir)).toBe(true)
  })

  it('writes JSON files with 2-space indentation', async () => {
    const canonical = makeCanonical('ready')
    const result = await writeKnowledgeArtifacts({
      outputDir: tmpDir,
      canonical,
      markdown: '# Test',
      chunks: [],
    })

    const raw = fs.readFileSync(result.canonicalPath, 'utf8')
    expect(raw).toContain('\n  ')
    const parsed = JSON.parse(raw)
    expect(parsed.sourceHash).toBe('abc123hash')
  })

  it('artifactDir path is processed/<sourceHash>', async () => {
    const canonical = makeCanonical('ready')
    const result = await writeKnowledgeArtifacts({
      outputDir: tmpDir,
      canonical,
      markdown: '# Test',
      chunks: [],
    })

    expect(result.artifactDir).toBe(path.join(tmpDir, 'processed', 'abc123hash'))
  })
})
