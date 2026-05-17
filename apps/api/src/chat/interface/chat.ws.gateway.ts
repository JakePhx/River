import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { TOKENS } from '@/_shared/application/tokens';
import type { BlockRepoPort } from '@/block/application/port/block.repo.port';
import { PrismaChatRepo } from '@/chat/infra/persistence/prisma/prisma-chat.repo';
import type { ChatUnreadSummaryDTO } from '@social/shared';

export const CHAT_MESSAGE_EVENT = 'chat.message';
export const CHAT_UNREAD_EVENT = 'chat.unread';
export const CHAT_THREAD_UPDATED_EVENT = 'chat.thread.updated';
export const CHAT_REQUEST_ACCEPTED_EVENT = 'chat.request.accepted';
export const CHAT_THREAD_DELETED_EVENT = 'chat.thread.deleted';
export const CHAT_TYPING_EVENT = 'chat.typing';
export const CHAT_PRESENCE_EVENT = 'chat.presence';
export const CHAT_READ_EVENT = 'chat.read';
export const CHAT_MESSAGE_UPDATED_EVENT = 'chat.message.updated';
export const CHAT_MESSAGE_DELETED_EVENT = 'chat.message.deleted';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly chatRepo: PrismaChatRepo,
    @Inject(TOKENS.BLOCK_REPO) private readonly blockRepo: BlockRepoPort,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwt.verify<{ sub: string }>(token);
      const userId = payload.sub;
      client.data.userId = userId;
      client.data.threadIds = new Set<string>();
      client.join(`user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    const threadIds = client.data.threadIds as Set<string> | undefined;
    if (userId && threadIds) {
      for (const threadId of threadIds) {
        this.server
          .to(`thread:${threadId}`)
          .emit(CHAT_PRESENCE_EVENT, { threadId, userId, online: false });
      }
    }
  }

  @SubscribeMessage('thread:subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { threadId: string },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId || !body?.threadId) return;

    const thread = await this.chatRepo.findThreadIfMember(body.threadId, userId);
    if (!thread) return;

    const peerId =
      thread.userIdLow === userId ? thread.userIdHigh : thread.userIdLow;
    if (await this.blockRepo.hasBlockingRelationBetween(userId, peerId)) {
      return;
    }

    client.join(`thread:${body.threadId}`);
    (client.data.threadIds as Set<string>).add(body.threadId);
    this.server
      .to(`thread:${body.threadId}`)
      .emit(CHAT_PRESENCE_EVENT, { threadId: body.threadId, userId, online: true });
  }

  @SubscribeMessage('thread:unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { threadId: string },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId || !body?.threadId) return;

    client.leave(`thread:${body.threadId}`);
    (client.data.threadIds as Set<string>).delete(body.threadId);
    this.server
      .to(`thread:${body.threadId}`)
      .emit(CHAT_PRESENCE_EVENT, { threadId: body.threadId, userId, online: false });
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { threadId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId || !body?.threadId) return;

    const thread = await this.chatRepo.findThreadIfMember(body.threadId, userId);
    if (!thread) return;
    const peerId =
      thread.userIdLow === userId ? thread.userIdHigh : thread.userIdLow;
    if (await this.blockRepo.hasBlockingRelationBetween(userId, peerId)) {
      return;
    }

    client
      .to(`thread:${body.threadId}`)
      .emit(CHAT_TYPING_EVENT, {
        threadId: body.threadId,
        userId,
        isTyping: !!body.isTyping,
      });
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToThread(threadId: string, event: string, data: unknown) {
    this.server.to(`thread:${threadId}`).emit(event, data);
  }

  emitUnread(userId: string, summary: ChatUnreadSummaryDTO) {
    this.emitToUser(userId, CHAT_UNREAD_EVENT, summary);
  }
}
