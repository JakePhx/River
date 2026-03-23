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
import { MarkNotificationReadUseCase } from './application/usecase/mark-notification-read.usecase';
import { GetNotificationsUseCase } from './application/usecase/get-notifications.usecase';

// Infra
import { PostCreatedConsumer } from './infra/kafka/consumers/post-created.consumer';
import { NotificationPrismaRepo } from './infra/prisma/notification-prisma.repo';

@Module({
  imports: [
    PrismaModule,
    KafkaModule,
    forwardRef(() => UserModule),
    forwardRef(() => FollowModule),
  ],
  controllers: [NotificationController, PostCreatedConsumer],
  providers: [
    NotificationWsController,
    GetNotificationsUseCase,
    CreatePostNotificationsUseCase,
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
  exports: [],
})
export class NotificationModule {}
