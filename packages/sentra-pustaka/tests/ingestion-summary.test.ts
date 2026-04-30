import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  createSummaryHeader,
  finalizeSummary,
  sanitizeError,
  writeSummary,
} from '../src/ingestion/ingestion-summary'
import type { DryRunDocumentResult } from '../src/ingestion/dry-run-types'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ingestion-summary-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function makeResult(status: DryRunDocumentResult['status']): DryRunDocumentResult {
  return { filePath: `/tmp/${status}.pdf`, status, warnings: [] }
}

describe('createSummaryHeader', () => {
  it('creates summary with zeros and ISO startedAt', () => {
    const summary = createSummaryHeader({ inputDir: '/in', outputDir: '/out', totalDiscoveredPdfs: 5 })

    expect(summary.totalDiscoveredPdfs).toBe(5)
    expect(summary.processedCount).toBe(0)
    expect(summary.readyCount).toBe(0)
    expect(summary.runId).toBeTruthy()
    expect(new Date(summary.startedAt).toISOString()).toBe(summary.startedAt)
  })
})

describe('finalizeSummary', () => {
  it('counts statuses correctly', () => {
    const header = createSummaryHeader({ inputDir: '/in', outputDir: '/out', totalDiscoveredPdfs: 6 })
    const results: DryRunDocumentResult[] = [
      makeResult('ready'),
      makeResult('ready'),
      makeResult('ready'),
      makeResult('needs_review'),
      makeResult('failed'),
      makeResult('skipped_duplicate'),
    ]

    const finalized = finalizeSummary(header, results)

    expect(finalized.readyCount).toBe(3)
    expect(finalized.needsReviewCount).toBe(1)
    expect(finalized.failedCount).toBe(1)
    expect(finalized.skippedDuplicateCount).toBe(1)
    expect(finalized.processedCount).toBe(5)
  })

  it('returns zero counts when all documents are skipped', () => {
    const header = createSummaryHeader({ inputDir: '/in', outputDir: '/out', totalDiscoveredPdfs: 2 })
    const results = [makeResult('skipped_duplicate'), makeResult('skipped_duplicate')]

    const finalized = finalizeSummary(header, results)

    expect(finalized.processedCount).toBe(0)
    expect(finalized.readyCount).toBe(0)
    expect(finalized.skippedDuplicateCount).toBe(2)
  })

  it('includes per-document results in finalized summary', () => {
    const header = createSummaryHeader({ inputDir: '/in', outputDir: '/out', totalDiscoveredPdfs: 1 })
    const result: DryRunDocumentResult = {
      filePath: '/tmp/test.pdf',
      status: 'ready',
      warnings: [],
      artifactPaths: { canonicalPath: '/out/processed/hash/canonical.json' },
    }

    const finalized = finalizeSummary(header, [result])

    expect(finalized.results[0].artifactPaths?.canonicalPath).toBeDefined()
  })
})

describe('sanitizeError', () => {
  it('truncates long error messages to 200 chars', () => {
    const long = 'x'.repeat(500)
    expect(sanitizeError(long)).toHaveLength(200)
  })

  it('extracts message from Error objects', () => {
    expect(sanitizeError(new Error('test message'))).toBe('test message')
  })
})

describe('writeSummary', () => {
  it('writes ingestion-summary.json to outputDir', () => {
    const header = createSummaryHeader({ inputDir: '/in', outputDir: tmpDir, totalDiscoveredPdfs: 0 })
    const finalized = finalizeSummary(header, [])

    const summaryPath = writeSummary(finalized, tmpDir)

    expect(fs.existsSync(summaryPath)).toBe(true)
    const parsed = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
    expect(parsed.runId).toBe(finalized.runId)
  })

  it('sanitizes error fields in written JSON (no stack traces)', () => {
    const header = createSummaryHeader({ inputDir: '/in', outputDir: tmpDir, totalDiscoveredPdfs: 1 })
    const result: DryRunDocumentResult = {
      filePath: '/tmp/test.pdf',
      status: 'failed',
      warnings: [],
      error: 'Error: Something failed\n    at Object.<anonymous> (/long/stack/trace.js:1:1)',
    }
    const finalized = finalizeSummary(header, [result])
    writeSummary(finalized, tmpDir)

    const parsed = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'ingestion-summary.json'), 'utf8')
    )
    expect(parsed.results[0].error).not.toContain('Object.<anonymous>')
    expect(parsed.results[0].error?.length).toBeLessThanOrEqual(200)
  })
})
