import type { UnicomEvent, UnicomRoomState } from '@the-abyss/unicom-core'

export interface UnicomEventStore {
  append(event: UnicomEvent): Promise<void>
  appendMany(events: UnicomEvent[]): Promise<void>
  appendAgentRegistration(event: UnicomEvent): Promise<void>
  listRoomEvents(roomId: string): Promise<UnicomEvent[]>
  listAgentRegistrationEvents(): Promise<UnicomEvent[]>
  listRoomStates(): Promise<UnicomRoomState[]>
  getRoomState(roomId: string): Promise<UnicomRoomState | null>
}
