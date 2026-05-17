import {
  ErrorResponseDTO,
  ListPostErrorResponseDTO,
  ListPostResponseDTO,
  CreatePostErrorResponseDTO,
  CreatePostResponseDTO,
  CreateCommentErrorResponseDTO,
  CreateCommentResponseDTO,
} from "@social/shared";

import type { User } from "../user/user.types";

export type PostAttachment = {
  id: string;
  url: string;
  contentType: string;
  byteSize: number;
  kind: "image" | "video";
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments: PostAttachment[];
  author: User;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: User;
};

export type FeedResponse = {
  items: Post[];
  nextCursor: string | null;
};

export type CreatePostDto = {
  content: string;
};

export type ListPostResponse = ListPostResponseDTO | ListPostErrorResponseDTO;

export type CreatePostResponse =
  | CreatePostResponseDTO
  | CreatePostErrorResponseDTO;

export type CreateCommentResponse =
  | CreateCommentResponseDTO
  | CreateCommentErrorResponseDTO;

export type PostError = ErrorResponseDTO;
