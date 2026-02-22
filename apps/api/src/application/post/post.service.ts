import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import { validatePostContent } from '../../domain/post/post.rules';
import { assertUserIsActive } from '../../domain/user/user.rules';
import type { PostRepoPort } from './ports/post-repo.port';
import type { PostUserPort } from './ports/post-user.port';

@Injectable()
export class PostService {
  constructor(
    @Inject(TOKENS.POST_REPO) private readonly posts: PostRepoPort,
    @Inject(TOKENS.POST_USER) private readonly users: PostUserPort,
  ) {}

  async create(authorId: string, content: string) {
    const active = await this.users.isActive(authorId);
    assertUserIsActive(active);

    const cleaned = validatePostContent(content);
    return this.posts.createPostTx(authorId, cleaned);
  }

  feed(userId: string) {
    return this.posts.feed(userId);
  }
}
