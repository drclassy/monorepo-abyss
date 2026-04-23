export type MedicalCategory = 'gen' | 'int' | 'pha' | 'ped' | 'obg' | 'bas'

export interface MedicalChunk {
  id?: string
  sourceFile: string
  category: MedicalCategory
  chunkIndex: number
  headingPath: string[]
  content: string
  tokenCount: number
  embedding?: number[]
  metadata?: Record<string, unknown>
  createdAt?: Date
}

export interface RAGQueryResult {
  answer: string
  chunks: RetrievedChunk[]
  source: 'local' | 'vertex' | 'hybrid'
  model: string
  status: 'SUCCESS' | 'ERROR'
  error?: string
  timestamp: string
}

export interface RetrievedChunk {
  id: string
  sourceFile: string
  category: string
  content: string
  headingPath: string[]
  similarity: number
}

export interface IngestionResult {
  file: string
  chunks: number
  embedded: number
  stored: number
  skipped: boolean
  error?: string
}

export interface SentraRAGConfig {
  ollamaBaseUrl?: string
  embeddingModel?: string
  generationModel?: string
  pgConnectionString?: string
  vertexEnabled?: boolean
  similarityThreshold?: number
  topK?: number
}
