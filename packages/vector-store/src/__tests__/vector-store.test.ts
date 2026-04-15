import { describe, it, expect, beforeEach } from 'vitest'

import { VectorStore, createVectorStore } from '../store'
import type { VectorDocument, VectorStoreConfig } from '../types'

describe('VectorStore', () => {
  let store: VectorStore
  const config: VectorStoreConfig = {
    provider: 'memory',
    dimensions: 1536,
  }

  beforeEach(() => {
    store = new VectorStore(config)
  })

  describe('upsert', () => {
    it('should upsert a document to memory store', async () => {
      const doc: VectorDocument = {
        id: 'doc-001',
        content: 'Test content for vector store',
        embedding: [0.1, 0.2, 0.3],
        metadata: { source: 'test' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await store.upsert(doc)
      const count = await store.count()

      expect(count).toBe(1)
    })

    it('should update existing document with same id', async () => {
      const doc1: VectorDocument = {
        id: 'doc-002',
        content: 'Original content',
        embedding: [0.1, 0.2],
        metadata: { version: 1 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const doc2: VectorDocument = {
        id: 'doc-002',
        content: 'Updated content',
        embedding: [0.3, 0.4],
        metadata: { version: 2 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await store.upsert(doc1)
      await store.upsert(doc2)
      const count = await store.count()

      expect(count).toBe(1)
    })
  })

  describe('query', () => {
    it('should query documents with keyword match', async () => {
      const doc1: VectorDocument = {
        id: 'doc-001',
        content: 'Machine learning is fascinating',
        embedding: [0.1, 0.2],
        metadata: { category: 'ai' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const doc2: VectorDocument = {
        id: 'doc-002',
        content: 'Deep learning advances',
        embedding: [0.3, 0.4],
        metadata: { category: 'ai' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const doc3: VectorDocument = {
        id: 'doc-003',
        content: 'Cloud infrastructure setup',
        embedding: [0.5, 0.6],
        metadata: { category: 'devops' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await store.upsert(doc1)
      await store.upsert(doc2)
      await store.upsert(doc3)

      const results = await store.query('learning', 10)

      expect(results).toHaveLength(2)
      expect(results.map((r) => r.id)).toContain('doc-001')
      expect(results.map((r) => r.id)).toContain('doc-002')
    })

    it('should respect query limit', async () => {
      for (let i = 0; i < 5; i++) {
        await store.upsert({
          id: `doc-${i}`,
          content: 'Test content with keyword',
          embedding: [0.1, 0.2],
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      const results = await store.query('keyword', 3)

      expect(results).toHaveLength(3)
    })

    it('should return empty array when no matches', async () => {
      const doc: VectorDocument = {
        id: 'doc-001',
        content: 'This is a test document',
        embedding: [0.1, 0.2],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await store.upsert(doc)
      const results = await store.query('nonexistent-keyword')

      expect(results).toHaveLength(0)
    })

    it('should include score and metadata in results', async () => {
      const doc: VectorDocument = {
        id: 'doc-001',
        content: 'Important clinical data',
        embedding: [0.1, 0.2],
        metadata: { patientId: 'P123', type: 'diagnosis' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await store.upsert(doc)
      const results = await store.query('clinical')

      expect(results).toHaveLength(1)
      expect(results[0].score).toBe(1.0)
      expect(results[0].metadata).toEqual(doc.metadata)
    })
  })

  describe('delete', () => {
    it('should delete document by id', async () => {
      const doc: VectorDocument = {
        id: 'doc-001',
        content: 'To be deleted',
        embedding: [0.1, 0.2],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await store.upsert(doc)
      expect(await store.count()).toBe(1)

      await store.delete('doc-001')
      expect(await store.count()).toBe(0)
    })

    it('should not throw when deleting non-existent id', async () => {
      await expect(store.delete('non-existent')).resolves.not.toThrow()
    })
  })

  describe('count', () => {
    it('should return 0 for empty store', async () => {
      const count = await store.count()
      expect(count).toBe(0)
    })

    it('should return correct count after multiple operations', async () => {
      await store.upsert({
        id: 'doc-1',
        content: 'Content 1',
        embedding: [0.1],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await store.upsert({
        id: 'doc-2',
        content: 'Content 2',
        embedding: [0.2],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await store.upsert({
        id: 'doc-3',
        content: 'Content 3',
        embedding: [0.3],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(await store.count()).toBe(3)

      await store.delete('doc-2')
      expect(await store.count()).toBe(2)
    })
  })
})

describe('createVectorStore', () => {
  it('should create a VectorStore instance', () => {
    const config: VectorStoreConfig = {
      provider: 'memory',
      dimensions: 768,
    }

    const store = createVectorStore(config)

    expect(store).toBeInstanceOf(VectorStore)
  })

  it('should work with different provider configs', () => {
    const providers: VectorStoreConfig['provider'][] = ['pinecone', 'weaviate', 'chroma', 'memory']

    providers.forEach((provider) => {
      const config: VectorStoreConfig = {
        provider,
        apiKey: 'test-key',
        baseUrl: 'https://test.example.com',
        indexName: 'test-index',
        dimensions: 1536,
      }

      const store = createVectorStore(config)
      expect(store).toBeInstanceOf(VectorStore)
    })
  })
})
