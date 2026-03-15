import { Inject } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Ports
import type { NotificationRepoPort } from '../port/notification.repo.port';
import type { UserRepoPort } from '@/user/application/port/user.repo.port';

// Entities, Value Objects, && DTOs
import { NotificationEntity } from '@/notification/domain/notification.entity';
import { UserNotFoundError } from '@/user/domain/errors';
import { UserId } from '@/user/domain/value-object/user-id.vo';

export class GetNotificationsUseCase {
  constructor(
    @Inject(TOKENS.NOTIFICATION_REPO)
    private readonly notificationRepo: NotificationRepoPort,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepoPort,
  ) {}

  async execute(userId: string): Promise<NotificationEntity[]> {
    const user = await this.userRepo.findById(UserId.from(userId));
    if (!user) throw new UserNotFoundError();

    return this.notificationRepo.findByUserId(user.id);
  }
}
