import { describe, expect, it } from 'vitest'

import {
  MessageSentPayloadSchema,
  UnicomEventSchema,
  reduceRoomState,
  type UnicomEvent,
} from '../index.js'

const actor = {
  type: 'agent' as const,
  id: 'builder-agent',
  displayName: 'Builder Agent',
  role: 'builder',
  capabilities: ['code-edit'],
}

function createEvent(overrides: Partial<UnicomEvent>): UnicomEvent {
  return {
    id: crypto.randomUUID(),
    roomId: 'room-1',
    type: 'message.sent',
    actor,
    payload: {},
    risk: 'low',
    requiresApproval: false,
    createdAt: '2026-05-27T00:00:00.000Z',
    evidenceIds: [],
    ...overrides,
  }
}

describe('UNICOM event contract', () => {
  it('validates room.created envelope', () => {
    const event = createEvent({
      type: 'room.created',
      payload: {
        id: 'room-1',
        slug: 'unicom-hub',
        title: 'UNICOM HUB',
        mode: 'approval-gated',
        status: 'active',
        lifecycle: 'active',
        createdAt: '2026-05-27T00:00:00.000Z',
        updatedAt: '2026-05-27T00:00:00.000Z',
        risk: 'medium',
        allowedPaths: ['packages/unicom'],
        forbiddenPaths: ['packages/sentra'],
      },
      risk: 'medium',
    })

    expect(() => UnicomEventSchema.parse(event)).not.toThrow()
  })

  it('validates message.sent payload', () => {
    const event = createEvent({
      payload: {
        message: {
          id: 'message-1',
          roomId: 'room-1',
          actorId: actor.id,
          actorName: actor.displayName,
          actorRole: actor.role,
          kind: 'note',
          body: 'I inspected the allowed files.',
          createdAt: '2026-05-27T00:00:00.000Z',
        },
      },
    })

    const parsed = MessageSentPayloadSchema.parse(event.payload)
    expect(parsed.message.kind).toBe('note')
  })

  it('validates agent.evidence payload', () => {
    const event = createEvent({
      type: 'agent.evidence',
      payload: {
        evidence: {
          id: 'evidence-1',
          roomId: 'room-1',
          summary: 'Targeted typecheck passed.',
          command: 'pnpm --filter @the-abyss/unicom-core typecheck',
          verificationCommands: ['pnpm --filter @the-abyss/unicom-core typecheck'],
          filesTouched: ['packages/unicom/core/src/index.ts'],
          createdAt: '2026-05-27T00:00:00.000Z',
        },
      },
      evidenceIds: ['evidence-1'],
      risk: 'medium',
    })

    expect(() => UnicomEventSchema.parse(event)).not.toThrow()
  })

  it('validates agent.registered payload', () => {
    const event = createEvent({
      type: 'agent.registered',
      payload: {
        agent: actor,
      },
    })

    expect(() => UnicomEventSchema.parse(event)).not.toThrow()
  })

  it('requires evidenceIds for completion claims', () => {
    const event = createEvent({
      type: 'agent.completion_claim',
      payload: {
        summary: 'Implementation complete.',
      },
      evidenceIds: [],
      risk: 'medium',
    })

    const parsed = UnicomEventSchema.parse(event)
    expect(parsed.evidenceIds).toHaveLength(0)
  })

  it('reconstructs participant, message, and decision state from events', () => {
    const events: UnicomEvent[] = [
      createEvent({
        type: 'room.created',
        payload: {
          id: 'room-1',
          slug: 'unicom-hub',
          title: 'UNICOM HUB',
          mode: 'approval-gated',
          status: 'active',
          lifecycle: 'active',
          createdAt: '2026-05-27T00:00:00.000Z',
          updatedAt: '2026-05-27T00:00:00.000Z',
          risk: 'medium',
          allowedPaths: ['packages/unicom'],
          forbiddenPaths: ['packages/sentra'],
        },
        risk: 'medium',
      }),
      createEvent({
        type: 'agent.registered',
        payload: { agent: actor },
      }),
      createEvent({
        type: 'message.sent',
        payload: {
          message: {
            id: 'message-1',
            roomId: 'room-1',
            actorId: actor.id,
            actorName: actor.displayName,
            actorRole: actor.role,
            kind: 'note',
            body: 'Scope looks clean.',
            createdAt: '2026-05-27T00:01:00.000Z',
          },
        },
      }),
      createEvent({
        type: 'decision.proposed',
        payload: {
          decision: {
            id: 'decision-1',
            roomId: 'room-1',
            title: 'Approve build',
            summary: 'Proceed with core package implementation.',
            status: 'proposed',
            createdAt: '2026-05-27T00:02:00.000Z',
            updatedAt: '2026-05-27T00:02:00.000Z',
            requiresApproval: true,
          },
        },
        risk: 'high',
        requiresApproval: true,
      }),
    ]

    const state = reduceRoomState(events)

    expect(state.room?.slug).toBe('unicom-hub')
    expect(state.participants[actor.id]?.displayName).toBe(actor.displayName)
    expect(state.messages).toHaveLength(1)
    expect(state.decisions['decision-1']?.status).toBe('proposed')
    expect(state.pendingApprovalEventIds).toHaveLength(1)
  })

  it('reconstructs archived room lifecycle from append-only events', () => {
    const events: UnicomEvent[] = [
      createEvent({
        type: 'room.created',
        payload: {
          id: 'room-1',
          slug: 'temporary-room',
          title: 'Temporary Room',
          mode: 'approval-gated',
          status: 'active',
          lifecycle: 'active',
          createdAt: '2026-05-27T00:00:00.000Z',
          updatedAt: '2026-05-27T00:00:00.000Z',
          risk: 'medium',
          allowedPaths: ['packages/unicom'],
          forbiddenPaths: ['packages/sentra'],
        },
        risk: 'medium',
      }),
      createEvent({
        type: 'room.archived',
        payload: {
          note: 'Archive temporary room after review.',
        },
        createdAt: '2026-05-27T00:05:00.000Z',
      }),
    ]

    const state = reduceRoomState(events)

    expect(state.lifecycle).toBe('archived')
    expect(state.room?.lifecycle).toBe('archived')
    expect(state.room?.archivedAt).toBe('2026-05-27T00:05:00.000Z')
  })
})
