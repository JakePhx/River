import { Module } from '@nestjs/common';
import { PrismaModule } from '@/_shared/infra/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { TOKENS } from '@/_shared/application/tokens';

// Controllers
import { FollowController } from './interface/follow.controller';

// Use cases
import { FollowUserUseCase } from './application/usecase/follow-user.usecase';
import { UnfollowUserUseCase } from './application/usecase/unfollow-user.usecase';
import { CancelFollowUseCase } from './application/usecase/cancel-follow.usecase';
import { AcceptFollowUseCase } from './application/usecase/accept-follow.usecase';
import { RejectFollowUseCase } from './application/usecase/reject-follow.usecase';

// Repositories
import { PrismaFollowRepo } from './infra/persistence/prisma/prisma-follow.repo';
import { PrismaFollowRequestRepo } from './infra/persistence/prisma/prisma-follow-request.repo';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [FollowController],
  providers: [
    // Use cases
    FollowUserUseCase,
    UnfollowUserUseCase,
    CancelFollowUseCase,
    AcceptFollowUseCase,
    RejectFollowUseCase,

    // Repositories
    { provide: TOKENS.FOLLOW_REPO, useClass: PrismaFollowRepo },
    { provide: TOKENS.FOLLOW_REQUEST_REPO, useClass: PrismaFollowRequestRepo },
  ],
  exports: [
    FollowUserUseCase,
    UnfollowUserUseCase,
    CancelFollowUseCase,
    AcceptFollowUseCase,
    RejectFollowUseCase,
  ],
})
export class FollowModule {}
