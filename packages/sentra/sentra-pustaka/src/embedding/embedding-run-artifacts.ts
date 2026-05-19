// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import fs from 'fs'
import path from 'path'

import type {
  EmbeddingRunSummary,
  EmbeddedChunkRecord,
  VectorWriteReport,
  SkippedRecord,
  FailureRecord,
} from './types.js'

/**
 * Writes all ABYSS-RAG-004 output artifacts for a completed embedding run.
 *
 * Output structure:
 *   data/embedding-artifacts/
 *   ├── runs/<embedding_run_id>/
 *   │   ├── embedding-run-summary.json
 *   │   ├── embedded-chunks.jsonl
 *   │   ├── vector-write-report.json
 *   │   ├── skipped.json
 *   │   └── failures.json
 *   └── latest-run.json
 */
export function writeEmbeddingRunArtifacts(params: {
  outputDir: string
  runId: string
  summary: EmbeddingRunSummary
  embeddedChunks: EmbeddedChunkRecord[]
  writeReport: VectorWriteReport
  skipped: SkippedRecord[]
  failures: FailureRecord[]
}): void {
  const { outputDir, runId, summary, embeddedChunks, writeReport, skipped, failures } = params

  const runDir = path.join(outputDir, 'runs', runId)
  fs.mkdirSync(runDir, { recursive: true })

  // embedding-run-summary.json
  fs.writeFileSync(
    path.join(runDir, 'embedding-run-summary.json'),
    JSON.stringify(summary, null, 2),
    'utf-8'
  )

  // embedded-chunks.jsonl — one JSON object per line, no full text
  const jsonl = embeddedChunks.map((r) => JSON.stringify(r)).join('\n')
  fs.writeFileSync(path.join(runDir, 'embedded-chunks.jsonl'), jsonl, 'utf-8')

  // vector-write-report.json
  fs.writeFileSync(
    path.join(runDir, 'vector-write-report.json'),
    JSON.stringify(writeReport, null, 2),
    'utf-8'
  )

  // skipped.json
  fs.writeFileSync(path.join(runDir, 'skipped.json'), JSON.stringify(skipped, null, 2), 'utf-8')

  // failures.json
  fs.writeFileSync(path.join(runDir, 'failures.json'), JSON.stringify(failures, null, 2), 'utf-8')

  // latest-run.json (top-level pointer)
  const latestRun = {
    embedding_run_id: runId,
    run_dir: path.join('runs', runId),
    completed_at: summary.completed_at,
    status: summary.status,
    write_mode: summary.write_mode,
    embedded_documents: summary.embedded_documents,
    embedded_chunks: summary.embedded_chunks,
  }
  fs.writeFileSync(
    path.join(outputDir, 'latest-run.json'),
    JSON.stringify(latestRun, null, 2),
    'utf-8'
  )
}

/**
 * Sanitizes an error message for safe artifact logging.
 * Strips stack traces and truncates to 300 chars.
 */
export function sanitizeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  const noStack = raw.replace(/\n\s+at\s+.*/g, '')
  return noStack.slice(0, 300)
}
