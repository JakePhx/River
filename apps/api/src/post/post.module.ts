import { Module } from '@nestjs/common';
import { PrismaModule } from '@/_shared/infra/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { PostController } from './interface/post.controller';
import { CreatePostUseCase } from './application/use-cases/create-post.usecase';
import { GetFeedUseCase } from './application/use-cases/get-feed.usecase';
import { TOKENS } from '@/_shared/application/tokens';
import { PrismaPostRepo } from './infra/persistence/prisma/prisma-post.repo';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [PostController],
  providers: [
    // Use cases
    CreatePostUseCase,
    GetFeedUseCase,

    // Repositories
    { provide: TOKENS.POST_REPO, useClass: PrismaPostRepo },
  ],
  exports: [CreatePostUseCase, GetFeedUseCase],
})
export class PostModule {}
