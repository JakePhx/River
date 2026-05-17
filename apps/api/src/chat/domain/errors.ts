import { ForbiddenError, NotFoundError, ValidationError } from '@/_shared/domain/errors';

export function chatCannotMessageSelf(): ValidationError {
  return new ValidationError({
    code: 'CHAT_CANNOT_MESSAGE_SELF',
    message: 'You cannot message yourself',
    status: 400,
  });
}

export function chatMessageEmpty(): ValidationError {
  return new ValidationError({
    code: 'CHAT_MESSAGE_EMPTY',
    message: 'Add a message or attach a file',
    status: 400,
  });
}

export function chatAttachmentUrlInvalid(): ValidationError {
  return new ValidationError({
    code: 'CHAT_ATTACHMENT_URL_INVALID',
    message: 'Attachment URL is not valid for this account',
    status: 400,
  });
}

export function chatAttachmentTooLarge(): ValidationError {
  return new ValidationError({
    code: 'CHAT_ATTACHMENT_TOO_LARGE',
    message: 'Attachment must be 100 MB or smaller',
    status: 400,
  });
}

export function chatThreadNotFound(): NotFoundError {
  return new NotFoundError({
    code: 'CHAT_THREAD_NOT_FOUND',
    message: 'Chat thread not found',
    status: 404,
  });
}

export function chatRejected(): ForbiddenError {
  return new ForbiddenError({
    code: 'CHAT_REJECTED',
    message: 'This conversation was declined',
    status: 403,
  });
}

export function chatMustAcceptFirst(): ForbiddenError {
  return new ForbiddenError({
    code: 'CHAT_MUST_ACCEPT_FIRST',
    message: 'Accept the message request before replying',
    status: 403,
  });
}

/** Requester already sent their first message; wait until the recipient accepts. */
export function chatWaitForRecipientAccept(): ForbiddenError {
  return new ForbiddenError({
    code: 'CHAT_WAIT_FOR_RECIPIENT_ACCEPT',
    message: 'Wait until they accept your message request before sending more',
    status: 403,
  });
}

export function chatBlocked(): ForbiddenError {
  return new ForbiddenError({
    code: 'CHAT_BLOCKED',
    message: 'Messaging is not available',
    status: 403,
  });
}

export function chatAcceptForbidden(): ForbiddenError {
  return new ForbiddenError({
    code: 'CHAT_ACCEPT_FORBIDDEN',
    message: 'Only the recipient can accept this request',
    status: 403,
  });
}

export function chatRejectForbidden(): ForbiddenError {
  return new ForbiddenError({
    code: 'CHAT_REJECT_FORBIDDEN',
    message: 'Only the recipient can decline this request',
    status: 403,
  });
}

export function chatReplyTargetInvalid(): ValidationError {
  return new ValidationError({
    code: 'CHAT_REPLY_TARGET_INVALID',
    message: 'That message is not part of this conversation',
    status: 400,
  });
}

export function chatMessageNotFound(): NotFoundError {
  return new NotFoundError({
    code: 'CHAT_MESSAGE_NOT_FOUND',
    message: 'Message not found',
    status: 404,
  });
}

export function chatMessageEditForbidden(): ForbiddenError {
  return new ForbiddenError({
    code: 'CHAT_MESSAGE_EDIT_FORBIDDEN',
    message: 'You can only edit your own text messages',
    status: 403,
  });
}

export function chatMessageEditAttachmentOnly(): ValidationError {
  return new ValidationError({
    code: 'CHAT_MESSAGE_EDIT_ATTACHMENT_ONLY',
    message: 'Only messages with text can be edited',
    status: 400,
  });
}
