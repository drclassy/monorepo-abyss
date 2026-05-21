import type { PortalStatus, UnicomAgentView } from '../types'

const DEFAULT_BASE = 'http://127.0.0.1:59849'

export interface UnicomHealth {
  status: string
  agents: number
  hubStatus: PortalStatus
  sseConnected: number
}

function getBaseUrl(): string {
  return process.env.UNICOM_BASE_URL?.trim() || DEFAULT_BASE
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const base = getBaseUrl()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const res = await fetch(`${base}${path}`, { cache: 'no-store', signal: controller.signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchUnicomHealth(): Promise<UnicomHealth> {
  const body = await fetchJson<{ status?: string; agents?: number; sseConnected?: number }>(
    '/health'
  )
  if (!body) {
    return { status: 'offline', agents: 0, hubStatus: 'unknown', sseConnected: 0 }
  }
  return {
    status: body.status ?? 'unknown',
    agents: body.agents ?? 0,
    hubStatus: body.status === 'ok' ? 'ok' : 'warn',
    sseConnected: body.sseConnected ?? 0,
  }
}

export async function fetchUnicomAgents(): Promise<UnicomAgentView[]> {
  const raw = await fetchJson<
    Array<{
      id: string
      displayName: string
      status: string
      lastSeen: number
      capabilities: string[]
      sseConnected?: boolean
      inboxDepth?: number
    }>
  >('/agents')

  if (!raw) return []

  const now = Date.now()
  return raw.map((agent) => ({
    id: agent.id,
    displayName: agent.displayName,
    status: agent.status,
    lastSeenAgoSec: Math.max(0, Math.round((now - agent.lastSeen) / 1000)),
    capabilities: agent.capabilities.slice(0, 4),
    sseConnected: agent.sseConnected,
    inboxDepth: agent.inboxDepth,
  }))
}

export function getUnicomBaseUrl(): string {
  return getBaseUrl()
}

/** SSE v2 ships separately; until /subscribe exists we label poll/inbox fallback. */
export async function fetchUnicomStats(): Promise<{
  sseEnabled: boolean
  sseConnected: string[]
  inboxDepths: Record<string, number>
  recentFeed: Array<{ id: string; from: string; to: string; timestamp: number; type: string }>
} | null> {
  return fetchJson('/stats')
}

export async function getUnicomDeliveryMode(): Promise<'sse' | 'poll' | 'unknown'> {
  const stats = await fetchUnicomStats()
  if (!stats) return 'unknown'
  if (stats.sseEnabled) return 'sse'
  return 'poll'
}
