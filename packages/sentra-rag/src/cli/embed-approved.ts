/**
 * ABYSS-RAG-004 CLI — Approved Knowledge Embedding and Vector Store Write Pipeline
 *
 * Usage:
 *   pnpm sentra-rag embed:approved [options]
 *
 * Options:
 *   --registry <path>   Path to knowledge-registry dir  (default: ./data/knowledge-registry)
 *   --artifacts <path>  Path to knowledge-artifacts dir (default: ./data/knowledge-artifacts)
 *   --output <path>     Path to embedding-artifacts dir (default: ./data/embedding-artifacts)
 *   --dry-run           Generate reports, zero vector writes (DEFAULT)
 *   --write             Write vectors to vector store
 */

import * as dotenv from 'dotenv'
import path from 'path'
import { runApprovedEmbeddingPipeline } from '../embedding/approved-embedding.pipeline.js'
import type { EmbeddingWriteMode } from '../embedding/types.js'

dotenv.config()

// ─── Arg parsing ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

function getArg(flag: string, defaultValue: string): string {
  const idx = args.indexOf(flag)
  if (idx !== -1 && args[idx + 1]) return args[idx + 1]
  return defaultValue
}

const registryDir = path.resolve(getArg('--registry', './data/knowledge-registry'))
const artifactsDir = path.resolve(getArg('--artifacts', './data/knowledge-artifacts'))
const outputDir = path.resolve(getArg('--output', './data/embedding-artifacts'))

const hasWrite = args.includes('--write')
const writeMode: EmbeddingWriteMode = hasWrite ? 'write' : 'dry_run'

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`[embed-approved] Starting ABYSS-RAG-004 pipeline`)
  console.log(`[embed-approved] Mode       : ${writeMode}`)
  console.log(`[embed-approved] Registry   : ${registryDir}`)
  console.log(`[embed-approved] Artifacts  : ${artifactsDir}`)
  console.log(`[embed-approved] Output     : ${outputDir}`)

  // Write mode requires DATABASE_URL and GOOGLE_APPLICATION_CREDENTIALS
  let databaseClient: import('@the-abyss/vector-store').VectorStoreDatabaseClient | undefined

  if (writeMode === 'write') {
    if (!process.env.DATABASE_URL) {
      console.error('[embed-approved] ERROR: DATABASE_URL must be set for --write mode')
      process.exit(1)
    }
    const { Pool } = await import('pg')
    const { PgPoolVectorAdapter } = await import('../embedding/pg-adapter.js')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    databaseClient = new PgPoolVectorAdapter(pool)
  }

  const summary = await runApprovedEmbeddingPipeline({
    registryDir,
    artifactsDir,
    outputDir,
    writeMode,
    gcpProjectId: process.env.GCP_PROJECT_ID,
    gcpLocation: process.env.GCP_LOCATION,
    databaseClient,
  })

  console.log(`[embed-approved] Run ID          : ${summary.embedding_run_id}`)
  console.log(`[embed-approved] Candidates      : ${summary.total_candidates}`)
  console.log(`[embed-approved] Embedded docs   : ${summary.embedded_documents}`)
  console.log(`[embed-approved] Embedded chunks : ${summary.embedded_chunks}`)
  console.log(`[embed-approved] Skipped docs    : ${summary.skipped_documents}`)
  console.log(`[embed-approved] Failed docs     : ${summary.failed_documents}`)
  console.log(`[embed-approved] Status          : ${summary.status}`)
  console.log(`[embed-approved] Artifacts       : ${outputDir}/runs/${summary.embedding_run_id}`)

  if (summary.status === 'failed') {
    process.exit(1)
  }
}

main().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[embed-approved] Fatal error: ${msg.slice(0, 200)}`)
  process.exit(1)
})
