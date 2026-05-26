import type { UnicomActor, UnicomRoom, UnicomTask } from '@the-abyss/unicom-core'

export function createFixtureActor(overrides: Partial<UnicomActor> = {}): UnicomActor {
  return {
    type: 'agent',
    id: 'fixture-agent',
    displayName: 'Fixture Agent',
    role: 'builder',
    capabilities: ['code-edit'],
    ...overrides,
  }
}

export function createFixtureRoom(overrides: Partial<UnicomRoom> = {}): UnicomRoom {
  return {
    id: 'room-1',
    slug: 'fixture-room',
    title: 'Fixture Room',
    mode: 'approval-gated',
    status: 'active',
    createdAt: '2026-05-27T00:00:00.000Z',
    updatedAt: '2026-05-27T00:00:00.000Z',
    risk: 'medium',
    allowedPaths: ['packages/unicom/'],
    forbiddenPaths: ['packages/sentra/'],
    ...overrides,
  }
}

export function createFixtureTask(overrides: Partial<UnicomTask> = {}): UnicomTask {
  return {
    id: 'task-1',
    objective: 'Fixture Task',
    scope: ['packages/unicom'],
    nonScope: ['packages/sentra'],
    allowedPaths: ['packages/unicom/'],
    forbiddenPaths: ['packages/sentra/'],
    verificationCommands: ['pnpm --filter @the-abyss/unicom-core test'],
    acceptanceCriteria: ['Reducer reconstructs room state'],
    risk: 'medium',
    status: 'active',
    assignedTo: ['fixture-agent'],
    ...overrides,
  }
}
