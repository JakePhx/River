import { Module, forwardRef } from '@nestjs/common';

import { PrismaModule } from '@/_shared/infra/prisma/prisma.module';
import { BlockModule } from '@/block/block.module';
import { UserModule } from '@/user/user.module';
import { TOKENS } from '@/_shared/application/tokens';
import { KafkaModule } from '@/_shared/infra/kakfa/kafka.module';
import { KafkaChatEventPublisher } from './infra/kafka/kafka-chat-event.publisher';

import { ChatController } from './interface/chat.controller';
import { ChatWsGateway } from './interface/chat.ws.gateway';
import { PrismaChatRepo } from './infra/persistence/prisma/prisma-chat.repo';

import { SendChatMessageUseCase } from './application/usecase/send-chat-message.usecase';
import { ListChatThreadsUseCase } from './application/usecase/list-chat-threads.usecase';
import { ListChatMessagesUseCase } from './application/usecase/list-chat-messages.usecase';
import { AcceptChatThreadUseCase } from './application/usecase/accept-chat-thread.usecase';
import { RejectChatThreadUseCase } from './application/usecase/reject-chat-thread.usecase';
import { MarkChatReadUseCase } from './application/usecase/mark-chat-read.usecase';
import { GetChatUnreadUseCase } from './application/usecase/get-chat-unread.usecase';
import { DeleteChatThreadUseCase } from './application/usecase/delete-chat-thread.usecase';
import { BlockPeerFromChatUseCase } from './application/usecase/block-peer-from-chat.usecase';
import { UpdateChatMessageUseCase } from './application/usecase/update-chat-message.usecase';
import { DeleteChatMessageUseCase } from './application/usecase/delete-chat-message.usecase';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => BlockModule),
    KafkaModule,
    forwardRef(() => UserModule),
  ],
  controllers: [ChatController],
  providers: [
    PrismaChatRepo,
    ChatWsGateway,
    SendChatMessageUseCase,
    ListChatThreadsUseCase,
    ListChatMessagesUseCase,
    AcceptChatThreadUseCase,
    RejectChatThreadUseCase,
    MarkChatReadUseCase,
    GetChatUnreadUseCase,
    DeleteChatThreadUseCase,
    BlockPeerFromChatUseCase,
    UpdateChatMessageUseCase,
    DeleteChatMessageUseCase,
    { provide: TOKENS.CHAT_EVENT_PUBLISHER, useClass: KafkaChatEventPublisher },
  ],
  exports: [GetChatUnreadUseCase, PrismaChatRepo],
})
export class ChatModule {}
