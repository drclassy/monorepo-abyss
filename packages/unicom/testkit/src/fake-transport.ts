import type { UnicomEvent } from '@the-abyss/unicom-core'

export interface RegisteredAgentRecord {
  id: string
  displayName: string
  role?: string
  capabilities: string[]
}

export class FakeUnicomTransport {
  public readonly events: UnicomEvent[] = []
  public readonly registeredAgents: RegisteredAgentRecord[] = []

  async registerAgent(agent: RegisteredAgentRecord): Promise<void> {
    this.registeredAgents.push(agent)
  }

  async publish(event: UnicomEvent): Promise<UnicomEvent> {
    this.events.push(event)
    return event
  }
}
