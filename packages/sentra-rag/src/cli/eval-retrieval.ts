/**
 * ABYSS-RAG-005 CLI — Retrieval Validation & Evidence Quality Evaluation Pipeline
 *
 * Usage:
 *   pnpm sentra-rag eval:retrieval [options]
 *
 * Options:
 *   --registry <path>             Registry dir         (default: ./data/knowledge-registry)
 *   --embedding-artifacts <path>  Embedding artifacts  (default: ./data/embedding-artifacts)
 *   --queries <path>              Query JSON file       (default: ./data/eval/retrieval-queries.json)
 *   --output <path>               Output dir           (default: ./data/retrieval-evaluation)
 *   --dry-run                     Validate inputs only, zero vector queries
 *   --top-k <number>              Top-K results per query (default: 5)
 *   --min-similarity <number>     Minimum similarity threshold (default: 0.5)
 *   --create-sample-queries       Create sample queries file and exit
 */

import path from 'path'
import { runRetrievalEvalPipeline } from '../evaluation/eval-pipeline.js'
import { createSampleQueriesFile } from '../evaluation/query-loader.js'
import type { EvalWriteMode } from '../evaluation/types.js'

// ─── Arg parsing ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

function getArg(flag: string, defaultValue: string): string {
  const idx = args.indexOf(flag)
  if (idx !== -1 && args[idx + 1]) return args[idx + 1]
  return defaultValue
}

function getNumArg(flag: string, defaultValue: number): number {
  const val = getArg(flag, String(defaultValue))
  const parsed = parseFloat(val)
  return isNaN(parsed) ? defaultValue : parsed
}

const registryDir = path.resolve(getArg('--registry', './data/knowledge-registry'))
const embeddingArtifactsDir = path.resolve(getArg('--embedding-artifacts', './data/embedding-artifacts'))
const queriesPath = path.resolve(getArg('--queries', './data/eval/retrieval-queries.json'))
const outputDir = path.resolve(getArg('--output', './data/retrieval-evaluation'))
const topK = getNumArg('--top-k', 5)
const minSimilarity = getNumArg('--min-similarity', 0.5)

const isDryRun = args.includes('--dry-run')
const isCreateSample = args.includes('--create-sample-queries')

const writeMode: EvalWriteMode = isDryRun ? 'dry_run' : 'eval'

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Helper: create sample queries file
  if (isCreateSample) {
    createSampleQueriesFile(queriesPath)
    console.log(`[eval-retrieval] Sample queries created at: ${queriesPath}`)
    return
  }

  console.log(`[eval-retrieval] Starting ABYSS-RAG-005 pipeline`)
  console.log(`[eval-retrieval] Mode                : ${writeMode}`)
  console.log(`[eval-retrieval] Registry            : ${registryDir}`)
  console.log(`[eval-retrieval] Embedding artifacts : ${embeddingArtifactsDir}`)
  console.log(`[eval-retrieval] Queries             : ${queriesPath}`)
  console.log(`[eval-retrieval] Output              : ${outputDir}`)
  console.log(`[eval-retrieval] Top-K               : ${topK}`)
  console.log(`[eval-retrieval] Min similarity      : ${minSimilarity}`)

  // Eval mode requires DATABASE_URL and GCP credentials
  let databaseClient: import('@the-abyss/vector-store').VectorStoreDatabaseClient | undefined

  if (writeMode === 'eval') {
    if (!process.env.DATABASE_URL) {
      console.error('[eval-retrieval] ERROR: DATABASE_URL must be set for eval mode')
      console.error('[eval-retrieval] Use --dry-run to validate inputs without a live database')
      process.exit(1)
    }
    const { Pool } = await import('pg')
    const { PgPoolVectorAdapter } = await import('../embedding/pg-adapter.js')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    databaseClient = new PgPoolVectorAdapter(pool)
  }

  const summary = await runRetrievalEvalPipeline({
    registryDir,
    embeddingArtifactsDir,
    queriesPath,
    outputDir,
    writeMode,
    topK,
    minSimilarity,
    gcpProjectId: process.env.GCP_PROJECT_ID,
    gcpLocation: process.env.GCP_LOCATION,
    databaseClient,
  })

  console.log(`[eval-retrieval] Run ID          : ${summary.retrieval_eval_run_id}`)
  console.log(`[eval-retrieval] Total queries   : ${summary.total_queries}`)
  console.log(`[eval-retrieval] Passed queries  : ${summary.passed_queries}`)
  console.log(`[eval-retrieval] Failed queries  : ${summary.failed_queries}`)
  console.log(`[eval-retrieval] Avg similarity  : ${summary.avg_similarity}`)
  console.log(`[eval-retrieval] AADI readiness  : ${summary.aadi_readiness}`)
  console.log(`[eval-retrieval] Status          : ${summary.status}`)
  console.log(`[eval-retrieval] Artifacts       : ${outputDir}/runs/${summary.retrieval_eval_run_id}`)

  if (summary.status === 'failed') {
    process.exit(1)
  }
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[eval-retrieval] Fatal error: ${msg.slice(0, 200)}`)
  process.exit(1)
})
