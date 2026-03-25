// src/notification/interface/notification.ws.controller.ts
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import type { RealtimeNotifierPort } from '@/notification/application/port/realtime.notifier';
import { NotificationEntity } from '@/notification/domain/notification.entity';

export const NOTIFICATION_CREATED_EVENT = 'notification.created';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationWsController
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    RealtimeNotifierPort
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

  async notifyUser(
    userId: string,
    notification: NotificationEntity,
  ): Promise<void> {
    const payload = {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      payload: notification.payload,
      isRead: notification.isRead,
      eventId: notification.eventId,
      processedAt: notification.processedAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
    this.emitToUser(userId, NOTIFICATION_CREATED_EVENT, payload);
  }
}
