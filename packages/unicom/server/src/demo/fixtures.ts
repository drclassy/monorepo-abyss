import type { UnicomActor } from '@the-abyss/unicom-core'

export function createDemoActor(overrides: Partial<UnicomActor> = {}): UnicomActor {
  return {
    type: 'agent',
    id: 'demo-agent',
    displayName: 'Demo Agent',
    role: 'builder',
    capabilities: ['code-edit'],
    ...overrides,
  }
}
