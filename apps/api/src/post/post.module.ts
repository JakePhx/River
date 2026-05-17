import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@/_shared/infra/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { PostController } from './interface/post.controller';
import { CreatePostUseCase } from './application/usecase/create-post.usecase';
import { GetFeedUseCase } from './application/usecase/get-feed.usecase';
import { GetPostDetailUseCase } from './application/usecase/get-post-detail.usecase';
import { GetUserPostsUseCase } from './application/usecase/get-user-posts.usecase';
import { CreateCommentUseCase } from './application/usecase/create-comment.usecase';
import { ListCommentsForPostUseCase } from './application/usecase/list-comments-for-post.usecase';
import { UpdatePostUseCase } from './application/usecase/update-post.usecase';
import { DeletePostUseCase } from './application/usecase/delete-post.usecase';
import { TOKENS } from '@/_shared/application/tokens';
import { PrismaPostRepo } from './infra/persistence/prisma/prisma-post.repo';
import { PrismaCommentRepo } from './infra/persistence/prisma/prisma-comment.repo';
import { KafkaPostEventPublisher } from './infra/kafka/publishers/kafka-event.publisher';
import { KafkaModule } from '@/_shared/infra/kakfa/kafka.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    KafkaModule,
  ],
  controllers: [PostController],
  providers: [
    // Use cases
    CreatePostUseCase,
    GetFeedUseCase,
    GetPostDetailUseCase,
    GetUserPostsUseCase,
    CreateCommentUseCase,
    ListCommentsForPostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,

    // Repositories
    { provide: TOKENS.POST_REPO, useClass: PrismaPostRepo },
    { provide: TOKENS.COMMENT_REPO, useClass: PrismaCommentRepo },
    { provide: TOKENS.POST_EVENT_PUBLISHER, useClass: KafkaPostEventPublisher },
  ],
  exports: [
    CreatePostUseCase,
    GetFeedUseCase,
    GetPostDetailUseCase,
    GetUserPostsUseCase,
    CreateCommentUseCase,
    ListCommentsForPostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
  ],
})
export class PostModule {}
