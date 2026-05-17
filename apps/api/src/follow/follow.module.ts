import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@/_shared/infra/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { BlockModule } from '../block/block.module';
import { TOKENS } from '@/_shared/application/tokens';
import { KafkaModule } from '@/_shared/infra/kakfa/kafka.module';
import { KafkaFollowEventPublisher } from './infra/kafka/kafka-follow-event.publisher';

// Controllers
import { FollowController } from './interface/follow.controller';

// Use cases
import { FollowUserUseCase } from './application/usecase/follow-user.usecase';
import { UnfollowUserUseCase } from './application/usecase/unfollow-user.usecase';
import { CancelFollowUseCase } from './application/usecase/cancel-follow.usecase';
import { AcceptFollowUseCase } from './application/usecase/accept-follow.usecase';
import { RejectFollowUseCase } from './application/usecase/reject-follow.usecase';
import { ListFollowersUseCase } from './application/usecase/list-followers.usecase';
import { ListFollowingUseCase } from './application/usecase/list-following.usecase';
import { GetRelationUseCase } from './application/usecase/get-relation.usecase';

// Repositories
import { PrismaFollowRepo } from './infra/persistence/prisma/prisma-follow.repo';
import { PrismaFollowRequestRepo } from './infra/persistence/prisma/prisma-follow-request.repo';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    BlockModule,
    KafkaModule,
  ],
  controllers: [FollowController],
  providers: [
    // Use cases
    FollowUserUseCase,
    UnfollowUserUseCase,
    CancelFollowUseCase,
    AcceptFollowUseCase,
    RejectFollowUseCase,
    ListFollowersUseCase,
    ListFollowingUseCase,
    GetRelationUseCase,

    // Repositories
    { provide: TOKENS.FOLLOW_REPO, useClass: PrismaFollowRepo },
    { provide: TOKENS.FOLLOW_REQUEST_REPO, useClass: PrismaFollowRequestRepo },
    { provide: TOKENS.FOLLOW_EVENT_PUBLISHER, useClass: KafkaFollowEventPublisher },
  ],
  exports: [
    FollowUserUseCase,
    UnfollowUserUseCase,
    CancelFollowUseCase,
    AcceptFollowUseCase,
    RejectFollowUseCase,
    ListFollowersUseCase,
    ListFollowingUseCase,
    GetRelationUseCase,
    TOKENS.FOLLOW_REPO,
  ],
})
export class FollowModule {}
