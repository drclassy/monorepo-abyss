import type { VectorDocument, QueryResult, VectorStoreConfig } from './types'

export class VectorStore {
  private config: VectorStoreConfig
  private documents: Map<string, VectorDocument>

  constructor(config: VectorStoreConfig) {
    this.config = config
    this.documents = new Map()
  }

  async upsert(document: VectorDocument): Promise<void> {
    if (this.config.provider === 'memory') {
      this.documents.set(document.id, document)
    } else {
      // TODO: Implement actual vector store providers
      console.log(`Upserting document to ${this.config.provider}`)
    }
  }

  async query(query: string, limit: number = 10): Promise<QueryResult[]> {
    if (this.config.provider === 'memory') {
      // Simple keyword search for memory provider
      const results: QueryResult[] = []
      for (const doc of this.documents.values()) {
        if (doc.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: doc.id,
            content: doc.content,
            score: 1.0,
            metadata: doc.metadata,
          })
        }
      }
      return results.slice(0, limit)
    } else {
      // TODO: Implement actual vector search
      console.log(`Querying ${this.config.provider}`)
      return []
    }
  }

  async delete(id: string): Promise<void> {
    this.documents.delete(id)
  }

  async count(): Promise<number> {
    return this.documents.size
  }
}

export function createVectorStore(config: VectorStoreConfig): VectorStore {
  return new VectorStore(config)
}
