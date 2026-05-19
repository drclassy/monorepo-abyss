import type { AgentEntry, AgentStatus } from './types.js'

const STALE_THRESHOLD_MS = 30_000

export class AgentRegistry {
  private agents = new Map<string, AgentEntry>()

  register(id: string, displayName: string, capabilities: string[]): AgentEntry {
    const now = Date.now()
    const entry: AgentEntry = {
      id,
      displayName,
      capabilities,
      status: 'connected',
      connectedAt: now,
      lastSeen: now,
    }
    this.agents.set(id, entry)
    return entry
  }

  updateStatus(id: string, status: AgentStatus): AgentEntry | undefined {
    const entry = this.agents.get(id)
    if (!entry) return undefined
    const updated: AgentEntry = { ...entry, status, lastSeen: Date.now() }
    this.agents.set(id, updated)
    return updated
  }

  heartbeat(id: string): void {
    const entry = this.agents.get(id)
    if (entry) this.agents.set(id, { ...entry, lastSeen: Date.now() })
  }

  remove(id: string): void {
    this.agents.delete(id)
  }

  list(): AgentEntry[] {
    return Array.from(this.agents.values())
  }

  evictStale(): string[] {
    const now = Date.now()
    const evicted: string[] = []
    for (const [id, entry] of this.agents) {
      if (now - entry.lastSeen > STALE_THRESHOLD_MS) {
        this.agents.delete(id)
        evicted.push(id)
      }
    }
    return evicted
  }

  startHeartbeatEviction(onEvict: (id: string) => void): NodeJS.Timeout {
    return setInterval(() => {
      for (const id of this.evictStale()) onEvict(id)
    }, 10_000)
  }
}
