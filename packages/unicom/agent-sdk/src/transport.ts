import type { UnicomEvent } from '@the-abyss/unicom-core'

export interface UnicomAgentTransport {
  registerAgent(agent: {
    id: string
    displayName: string
    role?: string
    capabilities: string[]
  }): Promise<void>
  publish(event: UnicomEvent): Promise<UnicomEvent>
}
