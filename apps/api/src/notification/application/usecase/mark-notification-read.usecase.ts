import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Ports
import type { NotificationRepoPort } from '../port/notification.repo.port';
import type { UserRepoPort } from '@/user/application/port/user.repo.port';

// Entities, Value Objects, && DTOs
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { UserNotFoundError } from '@/user/domain/errors';
import {
  NotificationNotFoundError,
  NotificationNotOwnedError,
} from '@/notification/domain/errors';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(TOKENS.NOTIFICATION_REPO)
    private readonly notificationRepo: NotificationRepoPort,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepoPort,
  ) {}

  async execute(params: {
    notificationId: string;
    userId: string;
  }): Promise<void> {
    const userId = UserId.from(params.userId);
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    const notification = await this.notificationRepo.findById(
      params.notificationId,
    );

    if (!notification) {
      throw new NotificationNotFoundError();
    }

    if (notification.userId !== params.userId) {
      throw new NotificationNotOwnedError();
    }

    notification.isRead = true;
    await this.notificationRepo.update(notification);
  }
}
