import type { QueryResult } from './types'

export interface SearchBackend {
  readonly name: string
  query(queryText: string, limit: number): Promise<QueryResult[]>
}

export class OpenAISearchBackend implements SearchBackend {
  readonly name = 'openai-file-search'

  private readonly apiKey: string
  private readonly vectorStoreId: string
  private readonly model: string

  constructor(vectorStoreId: string, model = 'text-embedding-3-small') {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        '[cermin] OpenAISearchBackend requires OPENAI_API_KEY env var. Set it before constructing this class, or use local pgvector.',
      )
    }

    this.apiKey = apiKey
    this.vectorStoreId = vectorStoreId
    this.model = model
  }

  async query(queryText: string, limit: number): Promise<QueryResult[]> {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: queryText,
        metadata: {
          embedding_model: this.model,
        },
        tools: [
          {
            type: 'file_search',
            vector_store_ids: [this.vectorStoreId],
            max_num_results: limit,
          },
        ],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`[cermin] OpenAI File Search query failed (${response.status}): ${body}`)
    }

    const data = await response.json()
    const annotations =
      data?.output
        ?.flatMap((block: { content?: unknown[] }) => block.content ?? [])
        ?.flatMap((content: { annotations?: unknown[] }) => content.annotations ?? [])
        ?.filter((annotation: { type?: string }) => annotation.type === 'file_citation') ?? []

    return annotations.map(
      (annotation: { file_id?: string; quote?: string }, index: number): QueryResult => ({
        id: annotation.file_id ?? `openai-result-${index}`,
        content: annotation.quote ?? '',
        score: 1 - index * 0.05,
        metadata: {
          source: 'openai-file-search',
          vector_store_id: this.vectorStoreId,
        },
      }),
    )
  }
}
