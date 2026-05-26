import type { UnicomEvent } from '@the-abyss/unicom-core'
import { describe, expect, it } from 'vitest'

import { PostgresEventStore } from '../postgres-event-store.js'
import { UNICOM_EVENTS_ROOM_INDEX_SQL, UNICOM_EVENTS_TABLE_SQL } from '../sql.js'

describe('UNICOM persistence', () => {
  it('exposes append-only SQL helpers', () => {
    expect(UNICOM_EVENTS_TABLE_SQL).toContain('CREATE TABLE IF NOT EXISTS unicom_events')
    expect(UNICOM_EVENTS_ROOM_INDEX_SQL).toContain('CREATE INDEX IF NOT EXISTS')
  })

  it('reconstructs room state from queried rows', async () => {
    const events: UnicomEvent[] = [
      {
        id: 'room-event',
        roomId: 'room-1',
        type: 'room.created',
        actor: {
          type: 'human',
          id: 'chief',
          displayName: 'Chief',
          role: 'chief',
          capabilities: [],
        },
        payload: {
          id: 'room-1',
          slug: 'persisted-room',
          title: 'Persisted Room',
          mode: 'approval-gated',
          status: 'active',
          createdAt: '2026-05-27T00:00:00.000Z',
          updatedAt: '2026-05-27T00:00:00.000Z',
          risk: 'medium',
          allowedPaths: ['packages/unicom/'],
          forbiddenPaths: ['packages/sentra/'],
        },
        risk: 'medium',
        requiresApproval: false,
        createdAt: '2026-05-27T00:00:00.000Z',
        evidenceIds: [],
      },
      {
        id: 'message-event',
        roomId: 'room-1',
        type: 'message.sent',
        actor: {
          type: 'agent',
          id: 'builder-agent',
          displayName: 'Builder Agent',
          role: 'builder',
          capabilities: ['code-edit'],
        },
        payload: {
          message: {
            id: 'message-1',
            roomId: 'room-1',
            actorId: 'builder-agent',
            actorName: 'Builder Agent',
            actorRole: 'builder',
            kind: 'note',
            body: 'Persisted hello.',
            createdAt: '2026-05-27T00:01:00.000Z',
          },
        },
        risk: 'low',
        requiresApproval: false,
        createdAt: '2026-05-27T00:01:00.000Z',
        evidenceIds: [],
      },
    ]

    const store = new PostgresEventStore({
      async query<T = unknown>() {
        return {
          rows: events.map((event) => ({
            id: event.id,
            room_id: event.roomId,
            task_id: event.taskId ?? null,
            type: event.type,
            actor_type: event.actor.type,
            actor_id: event.actor.id,
            actor_display_name: event.actor.displayName,
            actor_role: event.actor.role ?? null,
            actor_capabilities: event.actor.capabilities ?? [],
            payload: event.payload,
            risk: event.risk,
            requires_approval: event.requiresApproval,
            evidence_ids: event.evidenceIds,
            correlation_id: event.correlationId ?? null,
            parent_event_id: event.parentEventId ?? null,
            created_at: event.createdAt,
          })) as T[],
        }
      },
    })

    const state = await store.getRoomState('room-1')

    expect(state.room?.slug).toBe('persisted-room')
    expect(state.messages).toHaveLength(1)
  })
})
