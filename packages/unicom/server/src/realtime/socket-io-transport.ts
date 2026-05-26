import type http from 'node:http'

import type { UnicomEvent, UnicomRoomState } from '@the-abyss/unicom-core'
import { Server as SocketIOServer } from 'socket.io'

import type { RoomSummary } from '../types.js'

import type { UnicomTransportAdapter } from './transport-adapter.js'

export class SocketIoTransportAdapter implements UnicomTransportAdapter {
  private io: SocketIOServer | null = null

  constructor(
    private readonly options: {
      path?: string
      corsOrigin?: string
    } = {}
  ) {}

  attach(httpServer: http.Server): void {
    this.io = new SocketIOServer(httpServer, {
      path: this.options.path ?? '/socket.io',
      cors: {
        origin: this.options.corsOrigin ?? '*',
        methods: ['GET', 'POST'],
      },
    })

    this.io.on('connection', (socket) => {
      socket.on('room:join', (roomId: string) => {
        socket.join(roomId)
      })
      socket.on('room:leave', (roomId: string) => {
        socket.leave(roomId)
      })
    })
  }

  publishRoomUpdate(roomId: string, events: UnicomEvent[], state: UnicomRoomState): void {
    if (!this.io) {
      return
    }
    this.io.to(roomId).emit('room:events', events)
    this.io.to(roomId).emit('room:state', state)
  }

  publishRoomList(rooms: RoomSummary[]): void {
    this.io?.emit('rooms:list', rooms)
  }

  async dispose(): Promise<void> {
    await this.io?.close()
    this.io = null
  }
}
