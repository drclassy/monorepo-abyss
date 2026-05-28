import type { UnicomEvent } from '@the-abyss/unicom-core'

export interface RegisteredAgentInput {
  id: string
  displayName: string
  role?: string
  capabilities: string[]
}

export interface UnicomAgentTransport {
  registerAgent(agent: RegisteredAgentInput): Promise<void>
  publish(event: UnicomEvent): Promise<UnicomEvent>
}

export interface UnicomReadableAgentTransport extends UnicomAgentTransport {
  listRoomEvents(roomId: string): Promise<UnicomEvent[]>
}
