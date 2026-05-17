import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';

import { SendChatMessageUseCase } from '@/chat/application/usecase/send-chat-message.usecase';
import { ListChatThreadsUseCase } from '@/chat/application/usecase/list-chat-threads.usecase';
import { ListChatMessagesUseCase } from '@/chat/application/usecase/list-chat-messages.usecase';
import { AcceptChatThreadUseCase } from '@/chat/application/usecase/accept-chat-thread.usecase';
import { RejectChatThreadUseCase } from '@/chat/application/usecase/reject-chat-thread.usecase';
import { MarkChatReadUseCase } from '@/chat/application/usecase/mark-chat-read.usecase';
import { GetChatUnreadUseCase } from '@/chat/application/usecase/get-chat-unread.usecase';
import { DeleteChatThreadUseCase } from '@/chat/application/usecase/delete-chat-thread.usecase';
import { BlockPeerFromChatUseCase } from '@/chat/application/usecase/block-peer-from-chat.usecase';
import { UpdateChatMessageUseCase } from '@/chat/application/usecase/update-chat-message.usecase';
import { DeleteChatMessageUseCase } from '@/chat/application/usecase/delete-chat-message.usecase';

import {
  SendChatMessageBodyDTO,
  UpdateChatMessageBodyDTO,
} from '@social/shared';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly sendMessage: SendChatMessageUseCase,
    private readonly listThreads: ListChatThreadsUseCase,
    private readonly listMessages: ListChatMessagesUseCase,
    private readonly acceptThread: AcceptChatThreadUseCase,
    private readonly rejectThread: RejectChatThreadUseCase,
    private readonly markRead: MarkChatReadUseCase,
    private readonly getUnread: GetChatUnreadUseCase,
    private readonly deleteThread: DeleteChatThreadUseCase,
    private readonly blockPeerFromChat: BlockPeerFromChatUseCase,
    private readonly updateChatMessage: UpdateChatMessageUseCase,
    private readonly deleteChatMessage: DeleteChatMessageUseCase,
  ) {}

  @Get('unread')
  unread(@Req() req: any) {
    return this.getUnread.execute(req.user.userId.toString());
  }

  @Get('threads')
  threads(@Req() req: any) {
    return this.listThreads.execute(req.user.userId.toString());
  }

  @Get('threads/:threadId/messages')
  messages(
    @Req() req: any,
    @Param('threadId') threadId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId.toString();
    const lim = limit ? Number.parseInt(limit, 10) : undefined;
    return this.listMessages.execute({
      userId,
      threadId,
      cursor: cursor || undefined,
      limit: Number.isFinite(lim) ? lim : undefined,
    });
  }

  @Post('messages')
  send(@Req() req: any, @Body() dto: SendChatMessageBodyDTO) {
    return this.sendMessage.execute(req.user.userId.toString(), dto);
  }

  @Post('threads/:threadId/accept')
  accept(@Req() req: any, @Param('threadId') threadId: string) {
    return this.acceptThread.execute(req.user.userId.toString(), threadId);
  }

  @Post('threads/:threadId/reject')
  reject(@Req() req: any, @Param('threadId') threadId: string) {
    return this.rejectThread.execute(req.user.userId.toString(), threadId);
  }

  @Post('threads/:threadId/read')
  read(@Req() req: any, @Param('threadId') threadId: string) {
    return this.markRead.execute(req.user.userId.toString(), threadId);
  }

  @Delete('threads/:threadId')
  deleteChat(@Req() req: any, @Param('threadId') threadId: string) {
    return this.deleteThread.execute(req.user.userId.toString(), threadId);
  }

  @Post('threads/:threadId/block-peer')
  blockPeer(@Req() req: any, @Param('threadId') threadId: string) {
    return this.blockPeerFromChat.execute(
      req.user.userId.toString(),
      threadId,
    );
  }

  @Patch('messages/:messageId')
  updateMessage(
    @Req() req: any,
    @Param('messageId') messageId: string,
    @Body() dto: UpdateChatMessageBodyDTO,
  ) {
    return this.updateChatMessage.execute(
      req.user.userId.toString(),
      messageId,
      dto,
    );
  }

  @Delete('messages/:messageId')
  deleteMessage(@Req() req: any, @Param('messageId') messageId: string) {
    return this.deleteChatMessage.execute(
      req.user.userId.toString(),
      messageId,
    );
  }
}
