import {
  fetchUnicomAgents,
  fetchUnicomHealth,
  fetchUnicomStats,
  getUnicomBaseUrl,
  getUnicomDeliveryMode,
} from '../clients/unicom'
import type { PortalResponse, UnicomPayload } from '../types'

export async function loadUnicomPayload(): Promise<PortalResponse<UnicomPayload>> {
  const fetchedAt = new Date().toISOString()

  try {
    const [health, agents, stats, deliveryMode] = await Promise.all([
      fetchUnicomHealth(),
      fetchUnicomAgents(),
      fetchUnicomStats(),
      getUnicomDeliveryMode(),
    ])

    return {
      ok: true,
      data: {
        health,
        agents,
        baseUrl: getUnicomBaseUrl(),
        deliveryMode,
        sseConnected: stats?.sseConnected ?? [],
        inboxDepths: stats?.inboxDepths ?? {},
        recentFeed: stats?.recentFeed ?? [],
      },
      fetchedAt,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNICOM load failed'
    return { ok: false, error: message, fetchedAt }
  }
}
