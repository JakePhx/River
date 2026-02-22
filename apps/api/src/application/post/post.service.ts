import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../tokens';
import type { PostRepoPort } from './ports/post-repo.port';

@Injectable()
export class PostService {
  constructor(
    @Inject(TOKENS.POST_REPO)
    private readonly posts: PostRepoPort,
  ) {}

  create(authorId: string, content: string) {
    return this.posts.createPostTx(authorId, content);
  }

  feed(userId: string) {
    return this.posts.feed(userId);
  }
}
