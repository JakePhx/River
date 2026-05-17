// src/notification/notification.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Modules
import { PrismaModule } from '@/_shared/infra/prisma/prisma.module';
import { FollowModule } from '@/follow/follow.module';
import { UserModule } from '@/user/user.module';
import { KafkaModule } from '@/_shared/infra/kakfa/kafka.module';

// Controllers
import { NotificationController } from './interface/notification.controller';
import { NotificationWsController } from './interface/notification.ws.controller';

// Use Cases
import { CreatePostNotificationsUseCase } from './application/usecase/crate-post-notifications.usecase';
import { CreateUserNotificationUseCase } from './application/usecase/create-user-notification.usecase';
import { MarkNotificationReadUseCase } from './application/usecase/mark-notification-read.usecase';
import { GetNotificationsUseCase } from './application/usecase/get-notifications.usecase';

// Infra
import { ChatRequestAcceptedConsumer } from './infra/kafka/consumers/chat-request-accepted.consumer';
import { FollowReceivedConsumer } from './infra/kafka/consumers/follow-received.consumer';
import { FollowRequestAcceptedConsumer } from './infra/kafka/consumers/follow-request-accepted.consumer';
import { PostCommentedConsumer } from './infra/kafka/consumers/post-commented.consumer';
import { PostCreatedConsumer } from './infra/kafka/consumers/post-created.consumer';
import { NotificationPrismaRepo } from './infra/prisma/notification-prisma.repo';

@Module({
  imports: [
    PrismaModule,
    KafkaModule,
    forwardRef(() => UserModule),
    forwardRef(() => FollowModule),
  ],
  controllers: [
    NotificationController,
    PostCreatedConsumer,
    PostCommentedConsumer,
    FollowReceivedConsumer,
    FollowRequestAcceptedConsumer,
    ChatRequestAcceptedConsumer,
  ],
  providers: [
    NotificationWsController,
    GetNotificationsUseCase,
    CreatePostNotificationsUseCase,
    CreateUserNotificationUseCase,
    MarkNotificationReadUseCase,
    {
      provide: TOKENS.NOTIFICATION_REPO,
      useClass: NotificationPrismaRepo,
    },
    {
      provide: TOKENS.NOTIFICATION_WS_SERVICE,
      useClass: NotificationWsController,
    },
  ],
})
export class NotificationModule {}
