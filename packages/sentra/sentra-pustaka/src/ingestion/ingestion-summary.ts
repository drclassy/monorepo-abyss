// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

import type { DryRunDocumentResult, IngestionSummary } from './dry-run-types'

export function createSummaryHeader(params: {
  inputDir: string
  outputDir: string
  totalDiscoveredPdfs: number
}): IngestionSummary {
  return {
    runId: randomUUID(),
    startedAt: new Date().toISOString(),
    completedAt: '',
    inputDir: params.inputDir,
    outputDir: params.outputDir,
    totalDiscoveredPdfs: params.totalDiscoveredPdfs,
    processedCount: 0,
    readyCount: 0,
    needsReviewCount: 0,
    failedCount: 0,
    skippedDuplicateCount: 0,
    results: [],
  }
}

export function finalizeSummary(
  summary: IngestionSummary,
  results: DryRunDocumentResult[]
): IngestionSummary {
  const counts = { ready: 0, needs_review: 0, failed: 0, skipped_duplicate: 0 }
  for (const r of results) {
    counts[r.status]++
  }

  return {
    ...summary,
    completedAt: new Date().toISOString(),
    processedCount: results.filter((r) => r.status !== 'skipped_duplicate').length,
    readyCount: counts.ready,
    needsReviewCount: counts.needs_review,
    failedCount: counts.failed,
    skippedDuplicateCount: counts.skipped_duplicate,
    results,
  }
}

export function sanitizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  // Remove stack trace lines (lines starting with optional whitespace + "at ")
  const firstStackLine = msg.search(/\n\s+at /)
  const clean = firstStackLine >= 0 ? msg.slice(0, firstStackLine) : msg
  return clean.slice(0, 200)
}

export function writeSummary(summary: IngestionSummary, outputDir: string): string {
  fs.mkdirSync(outputDir, { recursive: true })
  const summaryPath = path.join(outputDir, 'ingestion-summary.json')
  const clean = {
    ...summary,
    results: summary.results.map((r) => ({
      ...r,
      error: r.error ? sanitizeError(r.error) : undefined,
    })),
  }
  fs.writeFileSync(summaryPath, JSON.stringify(clean, null, 2), 'utf8')
  return summaryPath
}
