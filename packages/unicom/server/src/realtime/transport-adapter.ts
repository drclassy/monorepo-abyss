import type { Server as HttpServer } from 'node:http'

import type { UnicomEvent, UnicomRoomState } from '@the-abyss/unicom-core'

import type { RoomSummary } from '../types.js'

export interface UnicomTransportAdapter {
  attach(httpServer: HttpServer): void
  publishRoomUpdate(roomId: string, events: UnicomEvent[], state: UnicomRoomState): void
  publishRoomList(rooms: RoomSummary[]): void
  dispose(): Promise<void> | void
}
