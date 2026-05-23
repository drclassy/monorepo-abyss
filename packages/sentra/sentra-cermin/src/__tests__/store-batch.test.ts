import { beforeEach, describe, expect, it, vi } from 'vitest'

import { VectorStore } from '../store'
import type { VectorStoreDatabaseClient } from '../types'

function makeMockDb(): VectorStoreDatabaseClient & {
  calls: Array<{ query: string; values: unknown[] }>
} {
  const calls: Array<{ query: string; values: unknown[] }> = []
  const executeMock = vi.fn(async (...args: [string, ...unknown[]]) => {
    const [query, ...values] = args
    calls.push({ query, values })
  })
  const queryMock = vi.fn(async () => [])

  return {
    calls,
    $executeRawUnsafe: executeMock as unknown as VectorStoreDatabaseClient['$executeRawUnsafe'],
    $queryRawUnsafe: queryMock as unknown as VectorStoreDatabaseClient['$queryRawUnsafe'],
  }
}

describe('VectorStore.upsertByIdBatch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('executes a single SQL call for 3 records', async () => {
    const db = makeMockDb()
    const store = new VectorStore({ database: db })

    const records = [
      { id: 'id1', content: 'text1', embedding: [0.1, 0.2], metadata: { page: 1 } },
      { id: 'id2', content: 'text2', embedding: [0.3, 0.4], metadata: { page: 2 } },
      { id: 'id3', content: 'text3', embedding: [0.5, 0.6], metadata: { page: 3 } },
    ]

    await store.upsertByIdBatch(records)

    expect(db.$executeRawUnsafe).toHaveBeenCalledTimes(1)
    const [query] = (db.$executeRawUnsafe as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(query).toContain('INSERT INTO "KnowledgeBase"')
    expect(query).toContain('ON CONFLICT')
  })

  it('throws if records array is empty', async () => {
    const db = makeMockDb()
    const store = new VectorStore({ database: db })

    await expect(store.upsertByIdBatch([])).rejects.toThrow('empty')
  })

  it('throws if no database configured', async () => {
    const store = new VectorStore()

    await expect(
      store.upsertByIdBatch([{ id: 'x', content: 'y', embedding: [0.1], metadata: {} }]),
    ).rejects.toThrow('database client is required')
  })
})
