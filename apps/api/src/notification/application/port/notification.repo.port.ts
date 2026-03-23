import { NotificationEntity } from '@/notification/domain/notification.entity';

import { UserId } from '@/user/domain/value-object/user-id.vo';

export interface NotificationRepoPort {
  createMany(notifications: NotificationEntity[]): Promise<void>;
  findByUserId(userId: UserId): Promise<NotificationEntity[]>;
  findById(id: string): Promise<NotificationEntity | null>;
  update(notification: NotificationEntity): Promise<void>;
}
