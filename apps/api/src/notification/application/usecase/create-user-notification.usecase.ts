import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { TOKENS } from '@/_shared/application/tokens';

import type { NotificationRepoPort } from '../port/notification.repo.port';
import type { RealtimeNotifierPort } from '../port/realtime.notifier';
import { NotificationEntity } from '@/notification/domain/notification.entity';
import { NotificationType } from '@/notification/domain/notification-type.enum';

@Injectable()
export class CreateUserNotificationUseCase {
  constructor(
    @Inject(TOKENS.NOTIFICATION_REPO)
    private readonly notificationRepo: NotificationRepoPort,
    @Inject(TOKENS.NOTIFICATION_WS_SERVICE)
    private readonly realtimeNotifier: RealtimeNotifierPort,
  ) {}

  async execute(params: {
    userId: string;
    type: NotificationType;
    payload: Record<string, unknown>;
    eventId?: string;
  }): Promise<void> {
    const eventId = params.eventId ?? randomUUID();
    const notification = NotificationEntity.create({
      userId: params.userId,
      type: params.type,
      payload: params.payload,
      eventId,
    });
    await this.notificationRepo.createMany([notification]);
    await this.realtimeNotifier.notifyUser(params.userId, notification);
  }
}
