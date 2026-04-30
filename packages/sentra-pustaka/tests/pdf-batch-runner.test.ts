import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

vi.mock('@the-abyss/document-ingestion', () => ({
  ingestDocument: vi.fn(),
  renderMarkdown: vi.fn(() => '# Mocked Markdown'),
  toChunkerInput: vi.fn(() => []),
}))

vi.mock('../src/ingestion/pdf-discovery', () => ({
  discoverPdfFiles: vi.fn(),
}))

import { runPdfDryRunIngestion } from '../src/ingestion/pdf-batch-runner'
import { ingestDocument, renderMarkdown, toChunkerInput } from '@the-abyss/document-ingestion'
import { discoverPdfFiles } from '../src/ingestion/pdf-discovery'

const mockDiscover = vi.mocked(discoverPdfFiles)
const mockIngest = vi.mocked(ingestDocument)

function makeIngestResult(sourceHash: string, status: 'ready' | 'needs_review' | 'failed') {
  return {
    canonical: {
      documentId: `doc-${sourceHash}`,
      sourceHash,
      documentVersion: '1.0',
      documentTitle: `Doc ${sourceHash}`,
      parserProvider: 'liteparse' as const,
      createdAt: new Date().toISOString(),
      preflight: {
        documentType: 'digital_pdf' as const,
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
        documentType: 'digital_pdf' as const,
        requiresReview: false,
        warnings: [],
      },
      pages: [],
      metadata: { pageCount: 1 },
    },
    qualityReport: {
      status,
      totalPages: 1,
      failedPages: [],
      lowConfidencePages: [],
      averageOcrConfidence: null,
      documentType: 'digital_pdf' as const,
      requiresReview: false,
      warnings: [],
    },
    markdown: '# Mocked',
    chunks: [],
  }
}

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'batch-runner-test-'))
  vi.clearAllMocks()
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('runPdfDryRunIngestion', () => {
  it('calls ingestDocument once per discovered PDF', async () => {
    mockDiscover.mockResolvedValue(['/tmp/a.pdf', '/tmp/b.pdf', '/tmp/c.pdf'])
    mockIngest
      .mockResolvedValueOnce(makeIngestResult('hash-a', 'ready') as any)
      .mockResolvedValueOnce(makeIngestResult('hash-b', 'ready') as any)
      .mockResolvedValueOnce(makeIngestResult('hash-c', 'ready') as any)

    const summary = await runPdfDryRunIngestion({ inputDir: '/tmp', outputDir: tmpDir })

    expect(mockIngest).toHaveBeenCalledTimes(3)
    expect(summary.totalDiscoveredPdfs).toBe(3)
  })

  it('continues processing after one PDF fails', async () => {
    mockDiscover.mockResolvedValue(['/tmp/ok.pdf', '/tmp/fail.pdf', '/tmp/ok2.pdf'])
    mockIngest
      .mockResolvedValueOnce(makeIngestResult('hash-ok', 'ready') as any)
      .mockRejectedValueOnce(new Error('OCR exploded'))
      .mockResolvedValueOnce(makeIngestResult('hash-ok2', 'ready') as any)

    const summary = await runPdfDryRunIngestion({ inputDir: '/tmp', outputDir: tmpDir })

    expect(summary.failedCount).toBe(1)
    expect(summary.readyCount).toBe(2)
    expect(mockIngest).toHaveBeenCalledTimes(3)
  })

  it('marks duplicate as skipped and does not call writeKnowledgeArtifacts again', async () => {
    const hash = 'duplicate-hash'
    const artifactDir = path.join(tmpDir, 'processed', hash)
    fs.mkdirSync(artifactDir, { recursive: true })

    mockDiscover.mockResolvedValue(['/tmp/dup.pdf'])
    mockIngest.mockResolvedValueOnce(makeIngestResult(hash, 'ready') as any)

    const summary = await runPdfDryRunIngestion({ inputDir: '/tmp', outputDir: tmpDir, force: false })

    expect(summary.skippedDuplicateCount).toBe(1)
    expect(summary.processedCount).toBe(0)
  })

  it('returns IngestionSummary with correct inputDir and outputDir', async () => {
    mockDiscover.mockResolvedValue([])

    const summary = await runPdfDryRunIngestion({ inputDir: '/my/input', outputDir: tmpDir })

    expect(summary.inputDir).toBe('/my/input')
    expect(summary.outputDir).toBe(tmpDir)
  })

  it('writes ingestion-summary.json to outputDir', async () => {
    mockDiscover.mockResolvedValue([])

    await runPdfDryRunIngestion({ inputDir: '/tmp', outputDir: tmpDir })

    expect(fs.existsSync(path.join(tmpDir, 'ingestion-summary.json'))).toBe(true)
  })

  it('writes failed/failures.json when there are failures', async () => {
    mockDiscover.mockResolvedValue(['/tmp/bad.pdf'])
    mockIngest.mockRejectedValueOnce(new Error('parse error'))

    await runPdfDryRunIngestion({ inputDir: '/tmp', outputDir: tmpDir })

    expect(fs.existsSync(path.join(tmpDir, 'failed', 'failures.json'))).toBe(true)
  })
})
