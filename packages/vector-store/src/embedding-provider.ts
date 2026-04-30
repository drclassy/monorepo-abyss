/**
 * Local Ollama Embedding Provider
 *
 * Default: `nomic-embed-text` via the local Ollama HTTP API.
 * This keeps vector-store provider-neutral and removes the legacy Google path.
 */
// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_EMBEDDING_MODEL = 'nomic-embed-text'
export const DEFAULT_EMBEDDING_DIMENSIONS = 768

export interface EmbeddingOptions {
  model?: string
  ollamaBaseUrl?: string
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Generates a dense embedding vector via local Ollama.
 *
 * @param text     - Input text to embed
 * @param options  - Optional overrides for model and Ollama base URL
 * @returns        - Float array of length 768
 */
export async function getEmbedding(
  text: string,
  options: EmbeddingOptions = {},
): Promise<number[]> {
  const model = options.model ?? DEFAULT_EMBEDDING_MODEL
  const baseUrl = options.ollamaBaseUrl ?? process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'

  const response = await fetch(`${baseUrl}/api/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: text,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `[vector-store] Ollama embedding request failed (${response.status}): ${errorBody}`,
    )
  }

  const data = await response.json()
  const values: number[] | undefined = data?.embedding

  if (!values || values.length === 0) {
    throw new Error(
      `[vector-store] Unexpected embedding response shape: ${JSON.stringify(data)}`,
    )
  }

  return values
}
