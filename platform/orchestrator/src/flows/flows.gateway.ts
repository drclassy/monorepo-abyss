import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, type OnGatewayInit } from '@nestjs/websockets'
import { type Server } from 'socket.io'

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class FlowsGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server

  afterInit(_server: Server) {
    console.log('[WebSocket] Flows Gateway initialized')
  }

  // Method to broadcast flow events to all connected clients (Sentra Portal)
  broadcastFlowEvent(event: string, payload: unknown) {
    this.server.emit(event, payload)
    console.log(`[WebSocket] Broadcasted event: ${event}`)
  }
}
