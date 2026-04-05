export interface VectorDocument {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface QueryResult {
  id: string
  content: string
  score: number
  metadata: Record<string, unknown>
}

export interface VectorStoreConfig {
  provider: 'pinecone' | 'weaviate' | 'chroma' | 'memory'
  apiKey?: string
  baseUrl?: string
  indexName?: string
  dimensions?: number
}

export type VectorStoreProvider = 'pinecone' | 'weaviate' | 'chroma' | 'memory'
