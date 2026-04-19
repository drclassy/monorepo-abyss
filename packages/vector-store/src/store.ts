import { prisma } from '@the-abyss/database'
import { getEmbedding } from './vertex-provider'
import type { QueryResult, VectorStoreConfig } from './types'

export class VectorStore {
  private config: VectorStoreConfig

  constructor(config: VectorStoreConfig) {
    this.config = config
  }

  /**
   * Mengonversi dokumen ke vektor dan menyimpannya di pgvector (Neon)
   */
  async upsert(content: string, metadata: any = {}): Promise<string> {
    console.log('Generating embedding via Vertex AI...')
    const embedding = await getEmbedding(content)
    
    // Simpan ke database menggunakan raw SQL karena Prisma Unsupported types
    const id = crypto.randomUUID()
    const embeddingString = `[${embedding.join(',')}]`
    
    await (prisma as any).$executeRawUnsafe(
      'INSERT INTO "KnowledgeBase" (id, content, embedding, metadata, "updatedAt") VALUES ($1, $2, $3::vector, $4, NOW())',
      id,
      content,
      embeddingString,
      JSON.stringify(metadata)
    )
    
    return id
  }

  /**
   * Mencari dokumen yang paling relevan berdasarkan pertanyaan
   */
  async query(userQuery: string, limit: number = 5): Promise<QueryResult[]> {
    console.log('Searching context for:', userQuery)
    const queryEmbedding = await getEmbedding(userQuery)
    const embeddingString = `[${queryEmbedding.join(',')}]`

    // Similarity search menggunakan Cosine Distance (<=>)
    const results = await (prisma as any).$queryRawUnsafe(
      'SELECT id, content, metadata, 1 - (embedding <=> $1::vector) as score FROM "KnowledgeBase" ORDER BY embedding <=> $1::vector LIMIT $2',
      embeddingString,
      limit
    )

    return (results as any[]).map(r => ({
      id: r.id,
      content: r.content,
      score: r.score,
      metadata: r.metadata
    }))
  }

  async delete(id: string): Promise<void> {
    await (prisma as any).$executeRawUnsafe('DELETE FROM "KnowledgeBase" WHERE id = $1', id)
  }
}

export function createVectorStore(config: VectorStoreConfig): VectorStore {
  return new VectorStore(config)
}
