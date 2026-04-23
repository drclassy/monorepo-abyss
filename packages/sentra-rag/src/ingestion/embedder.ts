import * as dotenv from 'dotenv'
dotenv.config()

const DEFAULT_MODEL = 'nomic-embed-text'
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'

export class OllamaEmbedder {
  private model: string
  private baseUrl: string

  constructor(model = DEFAULT_MODEL, baseUrl = OLLAMA_BASE) {
    this.model = model
    this.baseUrl = baseUrl
  }

  async embed(text: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt: text }),
    })

    if (!res.ok) throw new Error(`Ollama embed failed: ${res.status} ${await res.text()}`)
    const data = await res.json() as { embedding: number[] }
    return data.embedding
  }

  async embedBatch(texts: string[], concurrency = 3): Promise<number[][]> {
    const results: number[][] = []
    for (let i = 0; i < texts.length; i += concurrency) {
      const batch = texts.slice(i, i + concurrency)
      const embeddings = await Promise.all(batch.map(t => this.embed(t)))
      results.push(...embeddings)
      if (i + concurrency < texts.length) {
        process.stdout.write(`  embedding ${Math.min(i + concurrency, texts.length)}/${texts.length}\r`)
      }
    }
    return results
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`)
      if (!res.ok) return false
      const data = await res.json() as { models: Array<{ name: string }> }
      return data.models.some(m => m.name.startsWith(this.model.split(':')[0]))
    } catch {
      return false
    }
  }
}
