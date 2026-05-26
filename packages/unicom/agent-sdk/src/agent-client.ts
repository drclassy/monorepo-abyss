import type { UnicomEvent } from '@the-abyss/unicom-core'

import type { UnicomAgentTransport } from './transport.js'

export class UnicomAgentClient {
  constructor(private readonly transport: UnicomAgentTransport) {}

  registerAgent(input: {
    id: string
    displayName: string
    role?: string
    capabilities: string[]
  }): Promise<void> {
    return this.transport.registerAgent(input)
  }

  publish(event: UnicomEvent): Promise<UnicomEvent> {
    return this.transport.publish(event)
  }
}
