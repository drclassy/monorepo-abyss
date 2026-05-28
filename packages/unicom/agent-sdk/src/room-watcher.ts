import type { UnicomEvent } from '@the-abyss/unicom-core'

import type { UnicomReadableAgentTransport } from './transport.js'

export interface WatchRoomEventsOptions {
  pollIntervalMs?: number
  prime?: boolean
  onError?: (error: unknown) => void
}

export type RoomEventHandler = (events: UnicomEvent[]) => void | Promise<void>

export function watchRoomEvents(
  transport: UnicomReadableAgentTransport,
  roomId: string,
  handler: RoomEventHandler,
  options: WatchRoomEventsOptions = {}
): () => void {
  const pollIntervalMs = options.pollIntervalMs ?? 1000
  const shouldPrime = options.prime ?? true
  const seenEventIds = new Set<string>()
  let primed = false
  let active = true
  async function sync(): Promise<void> {
    const events = await transport.listRoomEvents(roomId)
    if (!active) {
      return
    }

    if (!primed && shouldPrime) {
      for (const event of events) {
        seenEventIds.add(event.id)
      }
      primed = true
      return
    }

    const freshEvents = events.filter((event) => !seenEventIds.has(event.id))
    for (const event of freshEvents) {
      seenEventIds.add(event.id)
    }
    primed = true

    if (freshEvents.length > 0) {
      await handler(freshEvents)
    }
  }

  void sync().catch((error) => {
    options.onError?.(error)
  })

  const timer = setInterval(() => {
    void sync().catch((error) => {
      options.onError?.(error)
    })
  }, pollIntervalMs)

  return () => {
    active = false
    if (timer) {
      clearInterval(timer)
    }
  }
}
