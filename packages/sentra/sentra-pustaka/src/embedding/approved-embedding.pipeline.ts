// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import fs from 'fs'
import path from 'path'
import { createVectorStore, DEFAULT_EMBEDDING_MODEL, DEFAULT_EMBEDDING_DIMENSIONS } from '@sentra/cermin'
import type {
  ApprovedEmbeddingPipelineParams,
  EmbeddedChunkRecord,
  EmbeddingRunSummary,
  FailureRecord,
  VectorWriteReport,
} from './types.js'
import { buildVectorId, buildChunkId, buildContentHash } from './vector-id.js'
import { loadApprovedCandidates } from './registry-gate.js'
import { writeEmbeddingRunArtifacts, sanitizeErrorMessage } from './embedding-run-artifacts.js'

/**
 * Minimal chunk shape read from chunks.json (produced by ABYSS-RAG-002).
 */
interface ChunkItem {
  content: string
  metadata: {
    source_hash: string
    page_number: number
    parser_provider: string
    ocr_confidence: number | null
    document_version: string
    document_title?: string
    ingestion_status: string
  }
}

// ─── Run ID ───────────────────────────────────────────────────────────────────

function buildEmbeddingRunId(): string {
  const now = new Date()
  const y = now.getUTCFullYear()
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const h = String(now.getUTCHours()).padStart(2, '0')
  const mi = String(now.getUTCMinutes()).padStart(2, '0')
  const s = String(now.getUTCSeconds()).padStart(2, '0')
  return `emb_${y}${mo}${d}_${h}${mi}${s}`
}

// ─── Chunk loader ─────────────────────────────────────────────────────────────

function loadChunks(
  artifactsDir: string,
  sourceHash: string,
): { chunks: ChunkItem[]; error?: string } {
  const chunksPath = path.join(artifactsDir, 'processed', sourceHash, 'chunks.json')
  if (!fs.existsSync(chunksPath)) {
    return { chunks: [], error: `chunks.json not found at ${chunksPath}` }
  }
  try {
    const raw = fs.readFileSync(chunksPath, 'utf-8')
    const chunks = JSON.parse(raw) as ChunkItem[]
    return { chunks }
  } catch (err) {
    return { chunks: [], error: sanitizeErrorMessage(err) }
  }
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

/**
 * ABYSS-RAG-004: Approved Knowledge Embedding and Vector Store Write Pipeline.
 *
 * Dry-run mode (default):
 *   - Reads registry + chunks, generates all artifacts.
 *   - Zero Google calls. Zero DB writes.
 *
 * Write mode (--write):
 *   - Reads registry + chunks.
 *   - Uses local Ollama embeddings for approved chunks.
 *   - Writes vectors via packages/vector-store (upsertById).
 *   - Generates all artifacts.
 */
export async function runApprovedEmbeddingPipeline(
  params: ApprovedEmbeddingPipelineParams,
): Promise<EmbeddingRunSummary> {
  const {
    registryDir,
    artifactsDir,
    outputDir,
    writeMode,
    embeddingModel = DEFAULT_EMBEDDING_MODEL,
    embeddingDimensions = DEFAULT_EMBEDDING_DIMENSIONS,
    databaseClient,
  } = params

  const runId = buildEmbeddingRunId()
  const startedAt = new Date().toISOString()

  const registryPath = path.join(registryDir, 'registry.json')
  const eligiblePath = path.join(registryDir, 'eligible-for-embedding.json')

  const embeddedChunks: EmbeddedChunkRecord[] = []
  const failures: FailureRecord[] = []
  const upsertedVectorIds: string[] = []
  const failedVectorIds: string[] = []

  // 1. Load and gate approved candidates
  const { approved, skipped } = loadApprovedCandidates(registryDir)

  let embeddedDocuments = 0
  let skippedDocuments = skipped.length
  let failedDocuments = 0
  let totalAttemptedWrites = 0
  let totalSuccessfulWrites = 0
  let totalFailedWrites = 0

  // 2. Setup vector store client (write mode only)
  const vectorStore =
    writeMode === 'write' && databaseClient
      ? createVectorStore({
          database: databaseClient,
          embeddingModel,
        })
      : null

  // 3. Process each approved document
  for (const entry of approved) {
    const { source_hash, document_version, document_title, parser_provider } = entry

    // Load chunks
    const { chunks, error: loadError } = loadChunks(artifactsDir, source_hash)

    if (loadError) {
      failures.push({
        source_hash,
        stage: 'artifact_read',
        error_code: 'ARTIFACT_READ_FAILED',
        message: loadError,
      })
      failedDocuments++
      continue
    }

    if (chunks.length === 0) {
      skipped.push({ source_hash, reason: 'empty_chunks' })
      skippedDocuments++
      continue
    }

    let docEmbeddingFailed = false

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx]
      const chunkMeta = chunk.metadata
      const pageNumber = chunkMeta?.page_number ?? 0
      const chunkId = buildChunkId(source_hash, pageNumber, idx)
      const vectorId = buildVectorId(
        source_hash,
        document_version,
        pageNumber,
        idx,
      )
      const contentHash = buildContentHash(chunk.content)

      // Attempt vector write (write mode only)
      if (writeMode === 'write' && vectorStore) {
        totalAttemptedWrites++
        try {
          await vectorStore.upsertById(vectorId, chunk.content, {
            source_hash,
            document_version,
            document_title: document_title ?? '',
            chunk_id: chunkId,
            vector_id: vectorId,
            page_number: pageNumber,
            parser_provider: chunkMeta?.parser_provider ?? parser_provider,
            ocr_confidence: chunkMeta?.ocr_confidence ?? null,
            registry_status: 'approved_for_embedding',
            content_hash: contentHash,
          })
          upsertedVectorIds.push(vectorId)
          totalSuccessfulWrites++
        } catch (err) {
          failures.push({
            source_hash,
            chunk_id: chunkId,
            stage: 'vector_write',
            error_code: 'VECTOR_WRITE_FAILED',
            message: sanitizeErrorMessage(err),
          })
          failedVectorIds.push(vectorId)
          totalFailedWrites++
          docEmbeddingFailed = true
          continue
        }
      }

      // Record embedded chunk (both modes)
      const record: EmbeddedChunkRecord = {
        source_hash,
        document_version,
        chunk_id: chunkId,
        vector_id: vectorId,
        page_number: pageNumber,
        parser_provider: chunkMeta?.parser_provider ?? parser_provider,
        ocr_confidence: chunkMeta?.ocr_confidence ?? null,
        registry_status: 'approved_for_embedding',
        embedding_model: embeddingModel,
        embedding_dimension: embeddingDimensions,
        content_hash: contentHash,
        embedded_at: new Date().toISOString(),
      }
      embeddedChunks.push(record)
    }

    if (docEmbeddingFailed) {
      failedDocuments++
    } else {
      embeddedDocuments++
    }
  }

  // 4. Determine run status
  const completedAt = new Date().toISOString()
  const status =
    failures.length === 0
      ? 'completed'
      : embeddedDocuments === 0 && approved.length > 0
        ? 'failed'
        : 'completed_with_failures'

  // 5. Build artifacts
  const summary: EmbeddingRunSummary = {
    embedding_run_id: runId,
    started_at: startedAt,
    completed_at: completedAt,
    registry_path: path.relative(process.cwd(), registryPath),
    eligible_path: path.relative(process.cwd(), eligiblePath),
    total_candidates: approved.length + skipped.filter((s) => s.reason !== 'empty_chunks').length,
    embedded_documents: embeddedDocuments,
    embedded_chunks: embeddedChunks.length,
    skipped_documents: skippedDocuments,
    failed_documents: failedDocuments,
    vector_store_provider: writeMode === 'write' ? 'local-pgvector' : 'dry_run_no_write',
    embedding_provider: writeMode === 'write' ? embeddingModel : 'dry_run_no_embedding',
    write_mode: writeMode,
    status,
  }

  const writeReport: VectorWriteReport = {
    attempted_writes: totalAttemptedWrites,
    successful_writes: totalSuccessfulWrites,
    failed_writes: totalFailedWrites,
    upserted_vector_ids: upsertedVectorIds,
    failed_vector_ids: failedVectorIds,
    idempotency_key: runId,
  }

  // 6. Write artifacts
  try {
    writeEmbeddingRunArtifacts({
      outputDir,
      runId,
      summary,
      embeddedChunks,
      writeReport,
      skipped,
      failures,
    })
  } catch (err) {
    console.error(
      `[embed-approved] Failed to write run artifacts: ${sanitizeErrorMessage(err)}`,
    )
  }

  return summary
}
