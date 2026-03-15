import { PostEntity } from '../../domain/post.entity';
import { UserEntityDTOMapperPort } from '@/user/application/port/user.mapper.port';

import { PostResponseDTO } from '@social/shared';

export class PostEntityDTOMapperPort {
  static toDTO(post: PostEntity): PostResponseDTO {
    if (!post.author) {
      throw new Error('Post author must be populated to map to DTO');
    }

    return {
      id: post.id.toString(),
      authorId: post.authorId.toString(),
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: UserEntityDTOMapperPort.toDTO(post.author),
    };
  }

  static toFeedDTO(posts: PostEntity[], nextCursor: string | null) {
    return {
      items: posts.map((p) => this.toDTO(p)),
      nextCursor,
    };
  }
}
