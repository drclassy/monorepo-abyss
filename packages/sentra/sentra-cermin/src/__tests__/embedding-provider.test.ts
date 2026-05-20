import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCircuitBreaker,
  getEmbeddingWithRetry,
} from '../embedding-provider'
import { EmbeddingCircuitOpenError } from '../types'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeOkResponse(embedding: number[]) {
  return {
    ok: true,
    json: async () => ({ embedding }),
    text: async () => '',
  }
}

function makeErrorResponse(status: number) {
  return {
    ok: false,
    status,
    text: async () => 'Internal Server Error',
    json: async () => ({}),
  }
}

describe('getEmbeddingWithRetry', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns embedding on first success', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse([0.1, 0.2, 0.3]))

    const result = await getEmbeddingWithRetry('hello')

    expect(result).toEqual([0.1, 0.2, 0.3])
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('retries on 500 and succeeds on second attempt', async () => {
    mockFetch
      .mockResolvedValueOnce(makeErrorResponse(500))
      .mockResolvedValueOnce(makeOkResponse([0.4, 0.5]))

    const result = await getEmbeddingWithRetry('hello', {}, { maxRetries: 3, baseDelayMs: 0 })

    expect(result).toEqual([0.4, 0.5])
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('throws after exhausting all retries', async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(503))

    await expect(
      getEmbeddingWithRetry('hello', {}, { maxRetries: 2, baseDelayMs: 0 })
    ).rejects.toThrow('Ollama embedding request failed')
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('opens circuit breaker after 5 consecutive failures within 60 seconds', async () => {
    const breaker = createCircuitBreaker()
    mockFetch.mockResolvedValue(makeErrorResponse(500))

    for (let i = 0; i < 5; i++) {
      await getEmbeddingWithRetry('text', {}, { maxRetries: 0, baseDelayMs: 0, circuitBreaker: breaker }).catch(() => {})
    }

    await expect(
      getEmbeddingWithRetry('text', {}, { maxRetries: 0, baseDelayMs: 0, circuitBreaker: breaker })
    ).rejects.toBeInstanceOf(EmbeddingCircuitOpenError)
  })
})
