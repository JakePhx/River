// src/notification/interface/notification.ws.controller.ts
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationWsController
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private getUserRoom(userId: string): string {
    return `user:${userId}:notifications`;
  }

  handleConnection(@ConnectedSocket() client: Socket): void {
    //Todo: Update to use JWT token for authentication
    const userId = client.handshake.auth?.userId as string | undefined;

    if (!userId) {
      client.disconnect();
      return;
    }

    client.join(this.getUserRoom(userId));
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    console.log(`Notification socket disconnected: ${client.id}`);
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.server.to(this.getUserRoom(userId)).emit(event, data);
  }
}
