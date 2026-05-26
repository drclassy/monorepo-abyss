import { reduceRoomState, type UnicomEvent, type UnicomRoomState } from '@the-abyss/unicom-core'

import type { UnicomEventStore } from './event-store.js'

export class MemoryEventStore implements UnicomEventStore {
  private readonly eventsByRoom = new Map<string, UnicomEvent[]>()
  private readonly agentRegistrationEvents: UnicomEvent[] = []

  async append(event: UnicomEvent): Promise<void> {
    const existing = this.eventsByRoom.get(event.roomId) ?? []
    existing.push(event)
    this.eventsByRoom.set(event.roomId, existing)
  }

  async appendMany(events: UnicomEvent[]): Promise<void> {
    for (const event of events) {
      await this.append(event)
    }
  }

  async appendAgentRegistration(event: UnicomEvent): Promise<void> {
    this.agentRegistrationEvents.push(event)
  }

  async listRoomEvents(roomId: string): Promise<UnicomEvent[]> {
    return [...(this.eventsByRoom.get(roomId) ?? [])]
  }

  async listAgentRegistrationEvents(): Promise<UnicomEvent[]> {
    return [...this.agentRegistrationEvents]
  }

  async listRoomStates(): Promise<UnicomRoomState[]> {
    return [...this.eventsByRoom.keys()].map((roomId) =>
      reduceRoomState(this.eventsByRoom.get(roomId) ?? [])
    )
  }

  async getRoomState(roomId: string): Promise<UnicomRoomState | null> {
    const events = this.eventsByRoom.get(roomId)
    if (!events) {
      return null
    }
    return reduceRoomState(events)
  }
}
