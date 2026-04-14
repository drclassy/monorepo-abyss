import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class FlowsGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    console.log('[WebSocket] Flows Gateway initialized');
  }

  // Method to broadcast flow events to all connected clients (Sentra Portal)
  broadcastFlowEvent(event: string, payload: any) {
    this.server.emit(event, payload);
    console.log(`[WebSocket] Broadcasted event: ${event}`);
  }
}
