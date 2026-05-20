// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { EmbeddingCircuitOpenError } from './types'

export const DEFAULT_EMBEDDING_MODEL = 'nomic-embed-text'
export const DEFAULT_EMBEDDING_DIMENSIONS = 768

export interface EmbeddingOptions {
  model?: string
  ollamaBaseUrl?: string
}

export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  circuitBreaker?: CircuitBreaker
}

export interface CircuitBreaker {
  consecutiveFailures: number
  windowStart: Date | null
  readonly threshold: number
  readonly windowMs: number
}

export function createCircuitBreaker(threshold = 5, windowMs = 60_000): CircuitBreaker {
  return { consecutiveFailures: 0, windowStart: null, threshold, windowMs }
}

function recordSuccess(breaker: CircuitBreaker): void {
  breaker.consecutiveFailures = 0
  breaker.windowStart = null
}

function recordFailure(breaker: CircuitBreaker): void {
  const now = new Date()
  if (!breaker.windowStart) {
    breaker.windowStart = now
  }

  if (now.getTime() - breaker.windowStart.getTime() > breaker.windowMs) {
    breaker.consecutiveFailures = 0
    breaker.windowStart = now
  }

  breaker.consecutiveFailures++
}

function isOpen(breaker: CircuitBreaker): boolean {
  if (breaker.consecutiveFailures >= breaker.threshold && breaker.windowStart) {
    const now = new Date()
    return now.getTime() - breaker.windowStart.getTime() <= breaker.windowMs
  }

  return false
}

async function fetchEmbedding(
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

export async function getEmbeddingWithRetry(
  text: string,
  options: EmbeddingOptions = {},
  retry: RetryOptions = {},
): Promise<number[]> {
  const { maxRetries = 3, baseDelayMs = 500, circuitBreaker } = retry

  if (circuitBreaker && isOpen(circuitBreaker)) {
    throw new EmbeddingCircuitOpenError(
      circuitBreaker.consecutiveFailures,
      circuitBreaker.windowStart!,
    )
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const embedding = await fetchEmbedding(text, options)
      if (circuitBreaker) {
        recordSuccess(circuitBreaker)
      }
      return embedding
    } catch (error) {
      lastError = error
      if (circuitBreaker) {
        recordFailure(circuitBreaker)
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError
}

export async function getEmbeddingBatch(
  texts: string[],
  options: EmbeddingOptions = {},
  concurrency = 8,
  retry: RetryOptions = {},
): Promise<number[][]> {
  const results: number[][] = new Array(texts.length)
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < texts.length) {
      const currentIndex = nextIndex++
      results[currentIndex] = await getEmbeddingWithRetry(texts[currentIndex], options, retry)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, texts.length) },
    () => worker(),
  )
  await Promise.all(workers)
  return results
}

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
  return getEmbeddingWithRetry(text, options, { maxRetries: 0 })
}
