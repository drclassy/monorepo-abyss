import { reduceRoomState, UnicomEventSchema, type UnicomEvent } from '@the-abyss/unicom-core'

export interface Queryable {
  query<T = unknown>(
    text: string,
    values?: unknown[]
  ): Promise<{
    rows: T[]
  }>
}

interface EventRow {
  id: string
  room_id: string
  task_id: string | null
  type: string
  actor_type: string
  actor_id: string
  actor_display_name: string
  actor_role: string | null
  actor_capabilities: string[] | null
  payload: unknown
  risk: string
  requires_approval: boolean
  evidence_ids: string[] | null
  correlation_id: string | null
  parent_event_id: string | null
  created_at: string
}

function rowToEvent(row: EventRow): UnicomEvent {
  return UnicomEventSchema.parse({
    id: row.id,
    roomId: row.room_id,
    taskId: row.task_id ?? undefined,
    type: row.type,
    actor: {
      type: row.actor_type,
      id: row.actor_id,
      displayName: row.actor_display_name,
      role: row.actor_role ?? undefined,
      capabilities: row.actor_capabilities ?? [],
    },
    payload: row.payload,
    risk: row.risk,
    requiresApproval: row.requires_approval,
    createdAt: row.created_at,
    correlationId: row.correlation_id ?? undefined,
    parentEventId: row.parent_event_id ?? undefined,
    evidenceIds: row.evidence_ids ?? [],
  })
}

export class PostgresEventStore {
  constructor(private readonly client: Queryable) {}

  async append(event: UnicomEvent): Promise<void> {
    await this.client.query(
      `
      INSERT INTO unicom_events (
        id, room_id, task_id, type,
        actor_type, actor_id, actor_display_name, actor_role, actor_capabilities,
        payload, risk, requires_approval, evidence_ids, correlation_id, parent_event_id, created_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16
      )
      `,
      [
        event.id,
        event.roomId,
        event.taskId ?? null,
        event.type,
        event.actor.type,
        event.actor.id,
        event.actor.displayName,
        event.actor.role ?? null,
        JSON.stringify(event.actor.capabilities ?? []),
        JSON.stringify(event.payload),
        event.risk,
        event.requiresApproval,
        event.evidenceIds,
        event.correlationId ?? null,
        event.parentEventId ?? null,
        event.createdAt,
      ]
    )
  }

  async listRoomEvents(roomId: string): Promise<UnicomEvent[]> {
    const result = await this.client.query<EventRow>(
      `
      SELECT
        id, room_id, task_id, type,
        actor_type, actor_id, actor_display_name, actor_role, actor_capabilities,
        payload, risk, requires_approval, evidence_ids, correlation_id, parent_event_id, created_at
      FROM unicom_events
      WHERE room_id = $1
      ORDER BY created_at ASC
      `,
      [roomId]
    )

    return result.rows.map(rowToEvent)
  }

  async getRoomState(roomId: string) {
    return reduceRoomState(await this.listRoomEvents(roomId))
  }
}
