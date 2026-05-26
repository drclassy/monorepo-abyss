import type { UnicomRoomState } from '@the-abyss/unicom-core'

import type { Queryable } from './postgres-event-store.js'
import { PostgresEventStore } from './postgres-event-store.js'

export async function loadRoomSnapshot(
  client: Queryable,
  roomId: string
): Promise<UnicomRoomState> {
  return new PostgresEventStore(client).getRoomState(roomId)
}
