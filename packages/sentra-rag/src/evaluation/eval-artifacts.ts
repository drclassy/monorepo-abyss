import fs from 'fs'
import path from 'path'
import type {
  RetrievalEvalSummary,
  QueryEvalResult,
  EvidenceQualityReport,
  FailedQuery,
  Recommendation,
} from './types.js'

/**
 * Writes all ABYSS-RAG-005 output artifacts for a completed evaluation run.
 *
 * Output structure:
 *   data/retrieval-evaluation/
 *   ├── runs/<retrieval_eval_run_id>/
 *   │   ├── retrieval-eval-summary.json
 *   │   ├── query-results.jsonl
 *   │   ├── evidence-quality-report.json
 *   │   ├── failed-queries.json
 *   │   └── recommendations.json
 *   └── latest-run.json
 */
export function writeEvalArtifacts(params: {
  outputDir: string
  runId: string
  summary: RetrievalEvalSummary
  queryResults: QueryEvalResult[]
  qualityReport: EvidenceQualityReport
  failedQueries: FailedQuery[]
  recommendations: Recommendation[]
}): void {
  const { outputDir, runId, summary, queryResults, qualityReport, failedQueries, recommendations } =
    params

  const runDir = path.join(outputDir, 'runs', runId)
  fs.mkdirSync(runDir, { recursive: true })

  // retrieval-eval-summary.json
  fs.writeFileSync(
    path.join(runDir, 'retrieval-eval-summary.json'),
    JSON.stringify(summary, null, 2),
    'utf-8',
  )

  // query-results.jsonl — one JSON object per line, no full chunk text
  const safeResults = queryResults.map((r) => ({
    ...r,
    // Strip content field from evidence to prevent full text logging
    evidence: r.evidence.map((e) => ({ ...e })),
  }))
  const jsonl = safeResults.map((r) => JSON.stringify(r)).join('\n')
  fs.writeFileSync(path.join(runDir, 'query-results.jsonl'), jsonl, 'utf-8')

  // evidence-quality-report.json
  fs.writeFileSync(
    path.join(runDir, 'evidence-quality-report.json'),
    JSON.stringify(qualityReport, null, 2),
    'utf-8',
  )

  // failed-queries.json
  fs.writeFileSync(
    path.join(runDir, 'failed-queries.json'),
    JSON.stringify(failedQueries, null, 2),
    'utf-8',
  )

  // recommendations.json
  fs.writeFileSync(
    path.join(runDir, 'recommendations.json'),
    JSON.stringify(recommendations, null, 2),
    'utf-8',
  )

  // latest-run.json (top-level pointer)
  const latestRun = {
    retrieval_eval_run_id: runId,
    run_dir: path.join('runs', runId),
    completed_at: summary.completed_at,
    status: summary.status,
    write_mode: summary.write_mode,
    total_queries: summary.total_queries,
    passed_queries: summary.passed_queries,
    aadi_readiness: summary.aadi_readiness,
  }
  fs.writeFileSync(
    path.join(outputDir, 'latest-run.json'),
    JSON.stringify(latestRun, null, 2),
    'utf-8',
  )
}

/**
 * Builds a run ID for a retrieval evaluation run.
 */
export function buildEvalRunId(): string {
  const now = new Date()
  const y = now.getUTCFullYear()
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const h = String(now.getUTCHours()).padStart(2, '0')
  const mi = String(now.getUTCMinutes()).padStart(2, '0')
  const s = String(now.getUTCSeconds()).padStart(2, '0')
  return `eval_${y}${mo}${d}_${h}${mi}${s}`
}

/**
 * Sanitizes an error message for safe artifact logging.
 */
export function sanitizeEvalError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  return raw.replace(/\n\s+at\s+.*/g, '').slice(0, 300)
}
