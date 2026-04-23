import { LocalBrainEngine } from './local.engine.js'
import type { RetrievedChunk } from '../types.js'

export interface HybridSearchResult {
  chunks: RetrievedChunk[]
  vertexContext?: string
  source: 'local' | 'vertex' | 'hybrid'
}

/**
 * [B] Hybrid Brain — local pgvector first, Vertex RAG optional fallback.
 * Vertex RAG is loaded dynamically to avoid hard dependency on @the-abyss/vertex-rag build.
 */
export class HybridBrainEngine {
  private local: LocalBrainEngine
  private minLocalResults: number
  private vertexEnabled: boolean

  constructor(local: LocalBrainEngine, minLocalResults = 2) {
    this.local = local
    this.minLocalResults = minLocalResults
    this.vertexEnabled = !!process.env.VERTEX_RAG_CORPUS_ID
  }

  async search(query: string, topK = 5): Promise<HybridSearchResult> {
    const localChunks = await this.local.search(query, topK)

    if (localChunks.length >= this.minLocalResults || !this.vertexEnabled) {
      return { chunks: localChunks, source: 'local' }
    }

    // Lazy fallback to Vertex RAG
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — vertex-rag is an optional peer, loaded at runtime only if corpus is configured
      const { VertexRAGConnector } = await import('@the-abyss/vertex-rag') as any
      const connector = new VertexRAGConnector()
      const vertexResult = await connector.query(query)
      const vertexContext = vertexResult?.status === 'SUCCESS' ? vertexResult.answer : undefined
      const source = localChunks.length > 0 ? 'hybrid' : 'vertex'
      console.log(`[HybridBrain] Augmented with Vertex RAG (source: ${source})`)
      return { chunks: localChunks, vertexContext, source }
    } catch {
      return { chunks: localChunks, source: 'local' }
    }
  }
}
