import { CommentEntity } from '@/post/domain/comment.entity';
import { UserEntityDTOMapperPort } from '@/user/application/port/user.mapper.port';
import { CommentResponseDTO } from '@social/shared';

export class CommentEntityDTOMapperPort {
  static toDTO(comment: CommentEntity): CommentResponseDTO {
    if (!comment.author) {
      throw new Error('Comment author must be populated to map to DTO');
    }
    return {
      id: comment.id.toString(),
      postId: comment.postId,
      authorId: comment.authorId.toString(),
      parentCommentId: comment.parentId ? comment.parentId.toString() : null,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: UserEntityDTOMapperPort.toDTO(comment.author),
    };
  }
}
