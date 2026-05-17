import type { CommentResponseDTO, PostResponseDTO } from "@social/shared";
import { toIsoTimestamp } from "../../shared/datetime";
import type { Comment, Post, PostAttachment } from "./post.types";
import { UserMapper } from "../user/user.mapper";

export class PostMapper {
  static toAttachment(dto: PostResponseDTO["attachments"][number]): PostAttachment {
    return {
      id: dto.id,
      url: dto.url,
      contentType: dto.contentType,
      byteSize: dto.byteSize,
      kind: dto.kind,
    };
  }

  static toPost(post: PostResponseDTO): Post {
    return {
      id: post.id,
      authorId: post.authorId,
      content: post.content,
      createdAt: toIsoTimestamp(post.createdAt),
      updatedAt: toIsoTimestamp(post.updatedAt),
      attachments: (post.attachments ?? []).map((a) => PostMapper.toAttachment(a)),
      author: UserMapper.toUser(post.author),
    };
  }

  static toComment(dto: CommentResponseDTO): Comment {
    return {
      id: dto.id,
      postId: dto.postId,
      authorId: dto.authorId,
      parentCommentId: dto.parentCommentId ?? null,
      content: dto.content,
      createdAt: toIsoTimestamp(dto.createdAt),
      updatedAt: toIsoTimestamp(dto.updatedAt),
      author: UserMapper.toUser(dto.author),
    };
  }
}
