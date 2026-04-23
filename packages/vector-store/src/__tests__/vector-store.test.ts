import { describe, it, expect, beforeEach, vi } from 'vitest'

import { VectorStore, createVectorStore } from '../store'
import type { VectorStoreDatabaseClient } from '../types'
import { getEmbedding } from '../vertex-provider'

vi.mock('../vertex-provider', () => ({
  DEFAULT_EMBEDDING_MODEL: 'text-embedding-004',
  getEmbedding: vi.fn(),
}))

describe('VectorStore', () => {
  const getEmbeddingMock = vi.mocked(getEmbedding)
  let database: VectorStoreDatabaseClient
  let executeRaw: ReturnType<typeof vi.fn>
  let queryRaw: ReturnType<typeof vi.fn>
  let store: VectorStore

  beforeEach(() => {
    executeRaw = vi.fn().mockResolvedValue(undefined)
    queryRaw = vi.fn().mockResolvedValue([])
    database = {
      $executeRawUnsafe: executeRaw,
      $queryRawUnsafe: queryRaw,
    }
    getEmbeddingMock.mockReset()
    getEmbeddingMock.mockResolvedValue([0.1, 0.2, 0.3])
    store = new VectorStore({ database })
  })

  it('requires caller-owned database injection before IO', async () => {
    const storeWithoutDatabase = new VectorStore()

    await expect(storeWithoutDatabase.upsert('clinical guideline')).rejects.toThrow(
      'database client is required',
    )
    expect(getEmbeddingMock).not.toHaveBeenCalled()
  })

  it('embeds and inserts content with a pgvector literal', async () => {
    const id = await store.upsert('adult fever guideline', { source: 'guideline.pdf' })

    expect(id).toMatch(/[0-9a-f-]{36}/)
    expect(getEmbeddingMock).toHaveBeenCalledWith('adult fever guideline', {
      model: 'text-embedding-004',
      taskType: 'RETRIEVAL_DOCUMENT',
      gcpProjectId: undefined,
      gcpLocation: undefined,
    })
    expect(executeRaw).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "KnowledgeBase"'),
      id,
      'adult fever guideline',
      '[0.1,0.2,0.3]',
      JSON.stringify({ source: 'guideline.pdf' }),
    )
  })

  it('uses RETRIEVAL_QUERY and sets HNSW ef_search before querying', async () => {
    queryRaw.mockResolvedValue([
      { id: 'kb-1', content: 'oxygen saturation guidance', metadata: { source: 'guideline.pdf' }, score: 0.92 },
    ])

    const results = await store.query('hypoxemia triage', 3)

    expect(getEmbeddingMock).toHaveBeenCalledWith('hypoxemia triage', {
      model: 'text-embedding-004',
      taskType: 'RETRIEVAL_QUERY',
      gcpProjectId: undefined,
      gcpLocation: undefined,
    })
    expect(executeRaw).toHaveBeenCalledWith('SET hnsw.ef_search = 100')
    expect(queryRaw).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT  $2::int'),
      '[0.1,0.2,0.3]',
      3,
    )
    expect(results).toEqual([
      { id: 'kb-1', content: 'oxygen saturation guidance', metadata: { source: 'guideline.pdf' }, score: 0.92 },
    ])
  })

  it('deletes a KnowledgeBase row by id', async () => {
    await store.delete('kb-1')

    expect(executeRaw).toHaveBeenCalledWith('DELETE FROM "KnowledgeBase" WHERE id = $1', 'kb-1')
  })
})

describe('createVectorStore', () => {
  it('creates a VectorStore instance with injected config', () => {
    const database: VectorStoreDatabaseClient = {
      $executeRawUnsafe: vi.fn(),
      $queryRawUnsafe: vi.fn(),
    }

    const store = createVectorStore({ database, embeddingDimensions: 768 })

    expect(store).toBeInstanceOf(VectorStore)
  })
})
