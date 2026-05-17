import {
  NotFoundError,
  ValidationError,
  DatabaseError,
  ForbiddenError,
} from '@/_shared/domain/errors';

export const PostErrorCode = {
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  POST_ID_INVALID: 'POST_ID_INVALID',
  POST_DATABASE_ERROR: 'POST_DATABASE_ERROR',
  POST_NOT_OWNER: 'POST_NOT_OWNER',
  POST_ATTACHMENTS_INVALID: 'POST_ATTACHMENTS_INVALID',
  POST_BODY_EMPTY: 'POST_BODY_EMPTY',
};

export type PostErrorCode = (typeof PostErrorCode)[keyof typeof PostErrorCode];

export class PostIdInvalidError extends ValidationError {
  constructor() {
    super({
      code: PostErrorCode.POST_ID_INVALID,
      message: 'Post ID is invalid',
    });
  }
}

export class PostDatabaseError extends DatabaseError {
  constructor() {
    super({
      code: PostErrorCode.POST_DATABASE_ERROR,
      message: 'Post database error',
    });
  }
}

export class PostNotFoundError extends NotFoundError {
  constructor() {
    super({
      code: PostErrorCode.POST_NOT_FOUND,
      message: 'Post not found',
    });
  }
}

export class PostNotOwnerError extends ForbiddenError {
  constructor() {
    super({
      code: PostErrorCode.POST_NOT_OWNER,
      message: 'You can only modify your own posts',
    });
  }
}

export const CommentErrorCode = {
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  COMMENT_ID_INVALID: 'COMMENT_ID_INVALID',
  PARENT_COMMENT_WRONG_POST: 'PARENT_COMMENT_WRONG_POST',
} as const;

export class CommentNotFoundError extends NotFoundError {
  constructor() {
    super({
      code: CommentErrorCode.COMMENT_NOT_FOUND,
      message: 'Comment not found',
    });
  }
}

export class CommentIdInvalidError extends ValidationError {
  constructor() {
    super({
      code: CommentErrorCode.COMMENT_ID_INVALID,
      message: 'Comment ID is invalid',
    });
  }
}

export class ParentCommentWrongPostError extends ValidationError {
  constructor() {
    super({
      code: CommentErrorCode.PARENT_COMMENT_WRONG_POST,
      message: 'Parent comment does not belong to this post',
    });
  }
}
