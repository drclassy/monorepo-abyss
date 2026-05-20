import type http from 'node:http'

const KEEPALIVE_INTERVAL_MS = 15_000

export class SseManager {
  private connections = new Map<string, http.ServerResponse>()
  private keepaliveTimer: NodeJS.Timeout

  constructor() {
    this.keepaliveTimer = setInterval(() => {
      for (const res of Array.from(this.connections.values())) {
        if (!res.writableEnded) {
          res.write('event: ping\ndata: {}\n\n')
        }
      }
    }, KEEPALIVE_INTERVAL_MS)
    this.keepaliveTimer.unref()
  }

  connect(agentId: string, res: http.ServerResponse): void {
    const existing = this.connections.get(agentId)
    if (existing) {
      existing.end()
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })

    this.connections.set(agentId, res)

    res.on('close', () => {
      if (this.connections.get(agentId) === res) {
        this.connections.delete(agentId)
      }
    })
  }

  disconnect(agentId: string): void {
    const res = this.connections.get(agentId)
    if (res) {
      res.end()
      this.connections.delete(agentId)
    }
  }

  push(agentId: string, event: string, data: unknown): boolean {
    const res = this.connections.get(agentId)
    if (!res || res.writableEnded) return false
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    return true
  }

  broadcast(event: string, data: unknown, excludeId?: string): void {
    for (const agentId of Array.from(this.connections.keys())) {
      if (agentId !== excludeId) {
        this.push(agentId, event, data)
      }
    }
  }

  isConnected(agentId: string): boolean {
    const res = this.connections.get(agentId)
    return res !== undefined && !res.writableEnded
  }

  dispose(): void {
    clearInterval(this.keepaliveTimer)
    for (const [, res] of this.connections) {
      res.end()
    }
    this.connections.clear()
  }
}

export function createSseManager(): SseManager {
  return new SseManager()
}
