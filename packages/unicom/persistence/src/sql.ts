export const UNICOM_EVENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS unicom_events (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  task_id TEXT,
  type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_display_name TEXT NOT NULL,
  actor_role TEXT,
  actor_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload JSONB NOT NULL,
  risk TEXT NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  evidence_ids TEXT[] NOT NULL DEFAULT '{}',
  correlation_id TEXT,
  parent_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL
);
`

export const UNICOM_EVENTS_ROOM_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS unicom_events_room_created_idx
ON unicom_events (room_id, created_at);
`
