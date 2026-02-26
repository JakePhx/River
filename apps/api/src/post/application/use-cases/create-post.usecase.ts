import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';
import { validatePostContent } from '../../domain/post.rules';
import { assertUserIsActive } from '../../../user/domain/user.rules';
import type { PostRepoPort } from '../ports/post-repo.port';
import type { PostUserPort } from '../ports/post-user.port';
import type { CreatePostInput } from '../models/post.models';
import type { UserId } from '@/_shared/application/models/ids';

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly posts: PostRepoPort,
    @Inject(TOKENS.POST_USER)
    private readonly users: PostUserPort,
  ) {}

  async execute(authorId: UserId, input: CreatePostInput) {
    const active = await this.users.isActive(authorId);
    assertUserIsActive(active);

    const cleaned = validatePostContent(input.content);
    return this.posts.createPostTx(authorId, cleaned);
  }
}
