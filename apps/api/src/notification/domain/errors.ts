import { ForbiddenError, NotFoundError } from '@/_shared/domain/errors';

export const NotificationErrorCode = {
  NOTIFICATION_NOT_FOUND: 'NOTIFICATION_NOT_FOUND',
  NOTIFICATION_NOT_OWNED: 'NOTIFICATION_NOT_OWNED',
} as const;

export type NotificationErrorCode =
  (typeof NotificationErrorCode)[keyof typeof NotificationErrorCode];

export class NotificationNotFoundError extends NotFoundError {
  constructor() {
    super({
      code: NotificationErrorCode.NOTIFICATION_NOT_FOUND,
      message: 'Notification not found',
    });
  }
}

export class NotificationNotOwnedError extends ForbiddenError {
  constructor() {
    super({
      code: NotificationErrorCode.NOTIFICATION_NOT_OWNED,
      message: 'You cannot update this notification',
    });
  }
}
