import { Module } from '@nestjs/common';
import { PrismaModule } from '@/_shared/infra/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { TOKENS } from '@/_shared/application/tokens';

// Controllers
import { BlockController } from './interface/block.controller';

// Use cases
import { BlockUserUseCase } from './application/usecase/block-user.usecase';
import { UnblockUserUseCase } from './application/usecase/unblock-user.usecase';

// Repositories
import { PrismaBlockRepo } from './infra/persistence/prisma/prisma-block.repo';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [BlockController],
  providers: [
    // Use cases
    BlockUserUseCase,
    UnblockUserUseCase,

    // Repositories
    { provide: TOKENS.BLOCK_REPO, useClass: PrismaBlockRepo },
  ],
  exports: [BlockUserUseCase, UnblockUserUseCase],
})
export class BlockModule {}
