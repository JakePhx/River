import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import type { PostRepoPort } from '../ports/post-repo.port';
import type { FeedItemRes } from '@social/shared';
import type { UserId } from '@/_shared/application/models/ids';

@Injectable()
export class GetFeedUseCase {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly posts: PostRepoPort,
  ) {}

  execute(
    userId: UserId,
    cursor?: string,
    take?: number,
  ): Promise<{ items: FeedItemRes[]; nextCursor: string | null }> {
    return this.posts.feed(userId, cursor, take);
  }
}
