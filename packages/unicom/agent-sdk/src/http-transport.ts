import type { UnicomEvent } from '@the-abyss/unicom-core'

import type { RegisteredAgentInput, UnicomReadableAgentTransport } from './transport.js'

export interface CreateHttpUnicomAgentTransportOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
}

export class HttpUnicomAgentTransport implements UnicomReadableAgentTransport {
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  constructor(options: CreateHttpUnicomAgentTransportOptions = {}) {
    this.baseUrl = options.baseUrl?.trim() || 'http://127.0.0.1:4318'
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  async registerAgent(agent: RegisteredAgentInput): Promise<void> {
    await this.request('/agents/register', {
      method: 'POST',
      body: JSON.stringify(agent),
    })
  }

  async publish(event: UnicomEvent): Promise<UnicomEvent> {
    const response = await this.request<{ event: UnicomEvent }>(`/rooms/${event.roomId}/events`, {
      method: 'POST',
      body: JSON.stringify({ event }),
    })

    return response.event
  }

  listRoomEvents(roomId: string): Promise<UnicomEvent[]> {
    return this.request<UnicomEvent[]>(`/rooms/${roomId}/events`)
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `UNICOM agent request failed with status ${response.status}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }
}

export function createHttpUnicomAgentTransport(
  options: CreateHttpUnicomAgentTransportOptions = {}
): HttpUnicomAgentTransport {
  return new HttpUnicomAgentTransport(options)
}
