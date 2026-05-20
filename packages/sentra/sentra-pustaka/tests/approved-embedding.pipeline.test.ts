import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import type { KnowledgeRegistry } from '../src/registry/registry-types'

// ─── Mock vector-store ────────────────────────────────────────────────────────
// Must be declared before dynamic imports that depend on it.

const {
  mockUpsertById,
  mockUpsertByIdBatch,
  mockGetEmbeddingBatch,
} = vi.hoisted(() => ({
  mockUpsertById: vi.fn().mockResolvedValue(undefined),
  mockUpsertByIdBatch: vi.fn().mockResolvedValue(undefined),
  mockGetEmbeddingBatch: vi.fn(async (texts: string[]) =>
    texts.map(() => Array(768).fill(0.1)),
  ),
}))

vi.mock('@sentra/cermin', () => ({
  createVectorStore: vi.fn(() => ({
    upsertById: mockUpsertById,
    upsertByIdBatch: mockUpsertByIdBatch,
  })),
  getEmbeddingBatch: mockGetEmbeddingBatch,
  DEFAULT_EMBEDDING_MODEL: 'text-embedding-004',
  DEFAULT_EMBEDDING_DIMENSIONS: 768,
}))

import { runApprovedEmbeddingPipeline } from '../src/embedding/approved-embedding.pipeline'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRegistry(entries: KnowledgeRegistry['entries']): KnowledgeRegistry {
  return {
    schema_version: '1.0.0',
    updated_at: new Date().toISOString(),
    entries,
  }
}

interface TestChunk {
  content: string
  metadata: {
    source_hash: string
    page_number: number
    parser_provider: string
    ocr_confidence: number
    document_version: string
    ingestion_status: string
  }
}

function makeChunks(sourceHash: string, version = 'v1'): TestChunk[] {
  return [
    {
      content: 'Clinical guideline text for page 1 chunk 1',
      metadata: {
        source_hash: sourceHash,
        page_number: 1,
        parser_provider: 'liteparse',
        ocr_confidence: 0.95,
        document_version: version,
        ingestion_status: 'ready',
      },
    },
    {
      content: 'Clinical guideline text for page 2 chunk 1',
      metadata: {
        source_hash: sourceHash,
        page_number: 2,
        parser_provider: 'liteparse',
        ocr_confidence: 0.92,
        document_version: version,
        ingestion_status: 'ready',
      },
    },
  ]
}

function setupTestDirs(
  tmpDir: string,
  approvedHashes: string[],
  allRegistryEntries: KnowledgeRegistry['entries'],
  chunksPerHash: Record<string, TestChunk[]>,
) {
  const registryDir = path.join(tmpDir, 'registry')
  const artifactsDir = path.join(tmpDir, 'artifacts')
  const outputDir = path.join(tmpDir, 'output')

  fs.mkdirSync(registryDir, { recursive: true })
  fs.mkdirSync(outputDir, { recursive: true })

  // Write registry.json
  const registry = makeRegistry(allRegistryEntries)
  fs.writeFileSync(path.join(registryDir, 'registry.json'), JSON.stringify(registry), 'utf-8')

  // Write eligible-for-embedding.json
  const eligible = approvedHashes.map((h) => ({
    source_hash: h,
    registry_status: 'approved_for_embedding',
  }))
  fs.writeFileSync(
    path.join(registryDir, 'eligible-for-embedding.json'),
    JSON.stringify(eligible),
    'utf-8',
  )

  // Write chunks.json per hash
  for (const [hash, chunks] of Object.entries(chunksPerHash)) {
    const chunkDir = path.join(artifactsDir, 'processed', hash)
    fs.mkdirSync(chunkDir, { recursive: true })
    fs.writeFileSync(path.join(chunkDir, 'chunks.json'), JSON.stringify(chunks), 'utf-8')
  }

  return { registryDir, artifactsDir, outputDir }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('runApprovedEmbeddingPipeline', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-004-test-'))
    mockUpsertById.mockReset()
    mockUpsertById.mockResolvedValue(undefined)
    mockUpsertByIdBatch.mockReset()
    mockUpsertByIdBatch.mockResolvedValue(undefined)
    mockGetEmbeddingBatch.mockReset()
    mockGetEmbeddingBatch.mockImplementation(async (texts: string[]) =>
      texts.map(() => Array(768).fill(0.1)),
    )
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('dry-run: generates all artifact files without vector writes', async () => {
    const hash = 'dryrunhash'
    const entry = {
      source_hash: hash,
      document_id: 'doc-1',
      document_version: 'v1',
      parser_provider: 'liteparse',
      page_count: 2,
      chunk_count: 2,
      quality_status: 'ready' as const,
      registry_status: 'approved_for_embedding' as const,
      created_at: new Date().toISOString(),
      registered_at: new Date().toISOString(),
      artifact_paths: {},
      warnings: [],
    }

    const { registryDir, artifactsDir, outputDir } = setupTestDirs(
      tmpDir,
      [hash],
      [entry],
      { [hash]: makeChunks(hash) },
    )

    const summary = await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'dry_run',
    })

    expect(summary.write_mode).toBe('dry_run')
    expect(summary.embedded_documents).toBe(1)
    expect(summary.embedded_chunks).toBe(2)
    expect(summary.chunks_attempted).toBe(2)
    expect(summary.chunks_succeeded).toBe(2)
    expect(summary.chunks_failed).toBe(0)
    expect(summary.failed_documents).toBe(0)
    expect(mockUpsertById).not.toHaveBeenCalled()
    expect(mockUpsertByIdBatch).not.toHaveBeenCalled()

    // Check artifact files exist
    const runDir = path.join(outputDir, 'runs', summary.embedding_run_id)
    expect(fs.existsSync(path.join(runDir, 'embedding-run-summary.json'))).toBe(true)
    expect(fs.existsSync(path.join(runDir, 'embedded-chunks.jsonl'))).toBe(true)
    expect(fs.existsSync(path.join(runDir, 'vector-write-report.json'))).toBe(true)
    expect(fs.existsSync(path.join(runDir, 'skipped.json'))).toBe(true)
    expect(fs.existsSync(path.join(runDir, 'failures.json'))).toBe(true)
    expect(fs.existsSync(path.join(outputDir, 'latest-run.json'))).toBe(true)
  })

  it('dry-run vector-write-report has zero writes', async () => {
    const hash = 'zerowrites'
    const entry = {
      source_hash: hash,
      document_id: 'doc-z',
      document_version: 'v1',
      parser_provider: 'liteparse',
      page_count: 1,
      chunk_count: 1,
      quality_status: 'ready' as const,
      registry_status: 'approved_for_embedding' as const,
      created_at: new Date().toISOString(),
      registered_at: new Date().toISOString(),
      artifact_paths: {},
      warnings: [],
    }

    const { registryDir, artifactsDir, outputDir } = setupTestDirs(
      tmpDir,
      [hash],
      [entry],
      { [hash]: makeChunks(hash) },
    )

    const summary = await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'dry_run',
    })

    const runDir = path.join(outputDir, 'runs', summary.embedding_run_id)
    const writeReport = JSON.parse(
      fs.readFileSync(path.join(runDir, 'vector-write-report.json'), 'utf-8'),
    )
    expect(writeReport.attempted_writes).toBe(0)
    expect(writeReport.successful_writes).toBe(0)
    expect(writeReport.upserted_vector_ids).toHaveLength(0)
  })

  it('only approved_for_embedding documents are embedded; others are skipped', async () => {
    const approvedHash = 'app-hash'
    const reviewHash = 'rev-hash'

    const entries: KnowledgeRegistry['entries'] = [
      {
        source_hash: approvedHash,
        document_id: 'doc-a',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 1,
        quality_status: 'ready',
        registry_status: 'approved_for_embedding',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
      {
        source_hash: reviewHash,
        document_id: 'doc-r',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 1,
        quality_status: 'needs_review',
        registry_status: 'ready_for_review',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
    ]

    const { registryDir, artifactsDir, outputDir } = setupTestDirs(
      tmpDir,
      [approvedHash, reviewHash],
      entries,
      {
        [approvedHash]: makeChunks(approvedHash),
        [reviewHash]: makeChunks(reviewHash),
      },
    )

    const summary = await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'dry_run',
    })

    expect(summary.embedded_documents).toBe(1)
    expect(summary.skipped_documents).toBeGreaterThanOrEqual(1)

    const runDir = path.join(outputDir, 'runs', summary.embedding_run_id)
    const skipped = JSON.parse(fs.readFileSync(path.join(runDir, 'skipped.json'), 'utf-8'))
    const skippedHashes = skipped.map((s: { source_hash: string }) => s.source_hash)
    expect(skippedHashes).toContain(reviewHash)
  })

  it('records failure when chunks.json is missing', async () => {
    const hash = 'missingchunks'
    const entry = {
      source_hash: hash,
      document_id: 'doc-mc',
      document_version: 'v1',
      parser_provider: 'liteparse',
      page_count: 1,
      chunk_count: 1,
      quality_status: 'ready' as const,
      registry_status: 'approved_for_embedding' as const,
      created_at: new Date().toISOString(),
      registered_at: new Date().toISOString(),
      artifact_paths: {},
      warnings: [],
    }

    const { registryDir, artifactsDir, outputDir } = setupTestDirs(
      tmpDir,
      [hash],
      [entry],
      {}, // no chunks written
    )

    const summary = await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'dry_run',
    })

    expect(summary.failed_documents).toBe(1)
    expect(summary.embedded_documents).toBe(0)

    const runDir = path.join(outputDir, 'runs', summary.embedding_run_id)
    const failures = JSON.parse(fs.readFileSync(path.join(runDir, 'failures.json'), 'utf-8'))
    expect(failures[0].stage).toBe('artifact_read')
    expect(failures[0].source_hash).toBe(hash)
  })

  it('write mode embeds in batch and calls upsertByIdBatch', async () => {
    const hash = 'writemodehash'
    const entry = {
      source_hash: hash,
      document_id: 'doc-w',
      document_version: 'v1',
      parser_provider: 'liteparse',
      page_count: 2,
      chunk_count: 2,
      quality_status: 'ready' as const,
      registry_status: 'approved_for_embedding' as const,
      created_at: new Date().toISOString(),
      registered_at: new Date().toISOString(),
      artifact_paths: {},
      warnings: [],
    }

    const { registryDir, artifactsDir, outputDir } = setupTestDirs(
      tmpDir,
      [hash],
      [entry],
      { [hash]: makeChunks(hash) },
    )

    const mockDbClient = {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    }

    await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'write',
      databaseClient: mockDbClient,
      concurrency: 4,
      batchSize: 100,
    })

    expect(mockGetEmbeddingBatch).toHaveBeenCalledTimes(1)
    expect(mockUpsertByIdBatch).toHaveBeenCalledTimes(1)
    expect(mockUpsertById).not.toHaveBeenCalled()
  })

  it('duplicate run produces same vector IDs (idempotency)', async () => {
    const hash = 'idempotent'
    const entry = {
      source_hash: hash,
      document_id: 'doc-i',
      document_version: 'v1',
      parser_provider: 'liteparse',
      page_count: 1,
      chunk_count: 1,
      quality_status: 'ready' as const,
      registry_status: 'approved_for_embedding' as const,
      created_at: new Date().toISOString(),
      registered_at: new Date().toISOString(),
      artifact_paths: {},
      warnings: [],
    }

    const { registryDir, artifactsDir, outputDir } = setupTestDirs(
      tmpDir,
      [hash],
      [entry],
      { [hash]: [makeChunks(hash)[0]] },
    )

    const run1 = await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'dry_run',
    })
    const run2 = await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'dry_run',
    })

    // Both runs should produce the same vector_id for the same chunk
    const getChunkIds = (runId: string) => {
      const file = path.join(outputDir, 'runs', runId, 'embedded-chunks.jsonl')
      return fs
        .readFileSync(file, 'utf-8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line).vector_id)
    }

    const ids1 = getChunkIds(run1.embedding_run_id)
    const ids2 = getChunkIds(run2.embedding_run_id)
    expect(ids1).toEqual(ids2)
  })

  it('failure in one document does not block the full batch', async () => {
    const goodHash = 'good-doc'
    const badHash = 'bad-doc'

    const entries: KnowledgeRegistry['entries'] = [
      {
        source_hash: goodHash,
        document_id: 'doc-g',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 1,
        quality_status: 'ready',
        registry_status: 'approved_for_embedding',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
      {
        source_hash: badHash,
        document_id: 'doc-b',
        document_version: 'v1',
        parser_provider: 'liteparse',
        page_count: 1,
        chunk_count: 1,
        quality_status: 'ready',
        registry_status: 'approved_for_embedding',
        created_at: new Date().toISOString(),
        registered_at: new Date().toISOString(),
        artifact_paths: {},
        warnings: [],
      },
    ]

    const { registryDir, artifactsDir, outputDir } = setupTestDirs(
      tmpDir,
      [goodHash, badHash],
      entries,
      { [goodHash]: makeChunks(goodHash) }, // badHash has no chunks → failure
    )

    const summary = await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'dry_run',
    })

    expect(summary.embedded_documents).toBe(1)
    expect(summary.failed_documents).toBe(1)
    expect(summary.status).toBe('completed_with_failures')
  })

  it('splits writes into multiple SQL batches when batchSize is smaller than chunk count', async () => {
    const hash = 'batched-doc'
    const entry = {
      source_hash: hash,
      document_id: 'doc-batch',
      document_version: 'v1',
      parser_provider: 'liteparse',
      page_count: 2,
      chunk_count: 2,
      quality_status: 'ready' as const,
      registry_status: 'approved_for_embedding' as const,
      created_at: new Date().toISOString(),
      registered_at: new Date().toISOString(),
      artifact_paths: {},
      warnings: [],
    }

    const { registryDir, artifactsDir, outputDir } = setupTestDirs(
      tmpDir,
      [hash],
      [entry],
      { [hash]: makeChunks(hash) },
    )

    await runApprovedEmbeddingPipeline({
      registryDir,
      artifactsDir,
      outputDir,
      writeMode: 'write',
      databaseClient: {
        $executeRawUnsafe: vi.fn(),
        $queryRawUnsafe: vi.fn(),
      },
      batchSize: 1,
    })

    expect(mockUpsertByIdBatch).toHaveBeenCalledTimes(2)
  })
})
