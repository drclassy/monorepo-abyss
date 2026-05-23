import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import type { KnowledgeRegistry } from '../src/registry/registry-types'
import type { EvalQuery } from '../src/evaluation/types'

// ─── Mock vector-store ────────────────────────────────────────────────────────

const mockQuery = vi.fn()
const mockEnsureSchema = vi.fn()

vi.mock('@sentra/cermin', () => ({
  createVectorStore: vi.fn(() => ({ ensureSchema: mockEnsureSchema, query: mockQuery })),
  DEFAULT_EMBEDDING_MODEL: 'text-embedding-004',
  DEFAULT_EMBEDDING_DIMENSIONS: 768,
}))

import { runRetrievalEvalPipeline } from '../src/evaluation/eval-pipeline'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRegistry(entries: KnowledgeRegistry['entries']): KnowledgeRegistry {
  return { schema_version: '1.0.0', updated_at: new Date().toISOString(), entries }
}

function makeApprovedEntry(hash: string) {
  return {
    source_hash: hash,
    document_id: `doc-${hash}`,
    document_version: 'v1',
    parser_provider: 'liteparse',
    page_count: 1,
    chunk_count: 2,
    quality_status: 'ready' as const,
    registry_status: 'approved_for_embedding' as const,
    created_at: new Date().toISOString(),
    registered_at: new Date().toISOString(),
    artifact_paths: {},
    warnings: [],
  }
}

function makeQueryFile(queries: EvalQuery[]): string {
  return JSON.stringify(queries)
}

function makeApprovedQueryResult(sourceHash: string) {
  return {
    id: `kb:${sourceHash}:v1:p001:c0001`,
    content: 'clinical text — not logged',
    score: 0.85,
    metadata: {
      source_hash: sourceHash,
      document_version: 'v1',
      page_number: 1,
      parser_provider: 'liteparse',
      ocr_confidence: 0.95,
      registry_status: 'approved_for_embedding',
    },
  }
}

function setupDirs(tmpDir: string, registryEntries: KnowledgeRegistry['entries'], queries: EvalQuery[]) {
  const registryDir = path.join(tmpDir, 'registry')
  const embeddingArtifactsDir = path.join(tmpDir, 'embedding-artifacts')
  const queriesPath = path.join(tmpDir, 'queries.json')
  const outputDir = path.join(tmpDir, 'output')

  fs.mkdirSync(registryDir, { recursive: true })
  fs.mkdirSync(embeddingArtifactsDir, { recursive: true })
  fs.mkdirSync(outputDir, { recursive: true })

  fs.writeFileSync(path.join(registryDir, 'registry.json'), JSON.stringify(makeRegistry(registryEntries)))
  fs.writeFileSync(queriesPath, makeQueryFile(queries))

  return { registryDir, embeddingArtifactsDir, queriesPath, outputDir }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('runRetrievalEvalPipeline', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-005-test-'))
    mockQuery.mockReset()
    mockEnsureSchema.mockReset()
    mockEnsureSchema.mockResolvedValue(undefined)
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('dry-run: generates all artifact files without querying vector store', async () => {
    const { registryDir, embeddingArtifactsDir, queriesPath, outputDir } = setupDirs(
      tmpDir,
      [makeApprovedEntry('hash1')],
      [{ query_id: 'q001', query_text: 'test query', top_k: 3 }],
    )

    const summary = await runRetrievalEvalPipeline({
      registryDir,
      embeddingArtifactsDir,
      queriesPath,
      outputDir,
      writeMode: 'dry_run',
    })

    expect(summary.write_mode).toBe('dry_run')
    expect(summary.mode_disclaimer).toContain('DRY_RUN')
    expect(mockQuery).not.toHaveBeenCalled()

    const runDir = path.join(outputDir, 'runs', summary.retrieval_eval_run_id)
    expect(fs.existsSync(path.join(runDir, 'retrieval-eval-summary.json'))).toBe(true)
    expect(fs.existsSync(path.join(runDir, 'query-results.jsonl'))).toBe(true)
    expect(fs.existsSync(path.join(runDir, 'evidence-quality-report.json'))).toBe(true)
    expect(fs.existsSync(path.join(runDir, 'failed-queries.json'))).toBe(true)
    expect(fs.existsSync(path.join(runDir, 'recommendations.json'))).toBe(true)
    expect(fs.existsSync(path.join(outputDir, 'latest-run.json'))).toBe(true)
  })

  it('eval mode: calls vector store query for each query', async () => {
    const hash = 'evalhash'
    mockQuery.mockResolvedValue([makeApprovedQueryResult(hash)])

    const { registryDir, embeddingArtifactsDir, queriesPath, outputDir } = setupDirs(
      tmpDir,
      [makeApprovedEntry(hash)],
      [
        { query_id: 'q001', query_text: 'first-line antibiotic for pneumonia', top_k: 3 },
        { query_id: 'q002', query_text: 'hypertension management in elderly', top_k: 3 },
      ],
    )

    const mockDbClient = {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    }

    const summary = await runRetrievalEvalPipeline({
      registryDir,
      embeddingArtifactsDir,
      queriesPath,
      outputDir,
      writeMode: 'eval',
      databaseClient: mockDbClient,
    })

    expect(mockEnsureSchema).toHaveBeenCalledTimes(1)
    expect(mockQuery).toHaveBeenCalledTimes(2)
    expect(summary.total_queries).toBe(2)
    expect(summary.passed_queries).toBeGreaterThanOrEqual(0)
  })

  it('non-approved evidence is flagged in quality report', async () => {
    const hash = 'suspendedhash'
    mockQuery.mockResolvedValue([
      {
        id: `kb:${hash}:v1:p001:c0001`,
        content: 'clinical text',
        score: 0.85,
        metadata: {
          source_hash: hash,
          document_version: 'v1',
          page_number: 1,
          registry_status: 'approved_for_embedding',
        },
      },
    ])

    // Registry shows it as superseded (approval revoked)
    const supersededEntry = {
      ...makeApprovedEntry(hash),
      registry_status: 'superseded' as const,
    }

    const { registryDir, embeddingArtifactsDir, queriesPath, outputDir } = setupDirs(
      tmpDir,
      [supersededEntry],
      [{ query_id: 'q001', query_text: 'test query', top_k: 3 }],
    )

    const mockDbClient = {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    }

    const summary = await runRetrievalEvalPipeline({
      registryDir,
      embeddingArtifactsDir,
      queriesPath,
      outputDir,
      writeMode: 'eval',
      databaseClient: mockDbClient,
    })

    const runDir = path.join(outputDir, 'runs', summary.retrieval_eval_run_id)
    const qualityReport = JSON.parse(
      fs.readFileSync(path.join(runDir, 'evidence-quality-report.json'), 'utf-8'),
    )
    expect(qualityReport.aadi_readiness).toBe('not_ready')
    expect(qualityReport.flagged_evidence).toBeGreaterThan(0)
  })

  it('failed query is recorded without stopping the batch', async () => {
    const hash = 'goodhash'
    mockQuery
      .mockResolvedValueOnce([makeApprovedQueryResult(hash)])  // q001 succeeds
      .mockRejectedValueOnce(new Error('connection timeout'))  // q002 fails

    const { registryDir, embeddingArtifactsDir, queriesPath, outputDir } = setupDirs(
      tmpDir,
      [makeApprovedEntry(hash)],
      [
        { query_id: 'q001', query_text: 'query one', top_k: 3 },
        { query_id: 'q002', query_text: 'query two', top_k: 3 },
      ],
    )

    const mockDbClient = {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    }

    const summary = await runRetrievalEvalPipeline({
      registryDir,
      embeddingArtifactsDir,
      queriesPath,
      outputDir,
      writeMode: 'eval',
      databaseClient: mockDbClient,
    })

    expect(summary.status).toBe('completed_with_failures')
    expect(summary.failed_queries).toBe(1)

    const runDir = path.join(outputDir, 'runs', summary.retrieval_eval_run_id)
    const failedQueries = JSON.parse(
      fs.readFileSync(path.join(runDir, 'failed-queries.json'), 'utf-8'),
    )
    expect(failedQueries[0].query_id).toBe('q002')
  })

  it('eval mode without databaseClient records setup failure', async () => {
    const { registryDir, embeddingArtifactsDir, queriesPath, outputDir } = setupDirs(
      tmpDir,
      [],
      [{ query_id: 'q001', query_text: 'test query' }],
    )

    const summary = await runRetrievalEvalPipeline({
      registryDir,
      embeddingArtifactsDir,
      queriesPath,
      outputDir,
      writeMode: 'eval',
      // no databaseClient
    })

    expect(summary.failed_queries).toBeGreaterThan(0)
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('recommendations.json includes AADI readiness recommendation', async () => {
    const { registryDir, embeddingArtifactsDir, queriesPath, outputDir } = setupDirs(
      tmpDir,
      [],
      [{ query_id: 'q001', query_text: 'test' }],
    )

    const summary = await runRetrievalEvalPipeline({
      registryDir,
      embeddingArtifactsDir,
      queriesPath,
      outputDir,
      writeMode: 'dry_run',
    })

    const runDir = path.join(outputDir, 'runs', summary.retrieval_eval_run_id)
    const recommendations = JSON.parse(
      fs.readFileSync(path.join(runDir, 'recommendations.json'), 'utf-8'),
    )
    expect(recommendations.length).toBeGreaterThan(0)
    expect(recommendations[0].type).toBe('INFO')
  })
})
