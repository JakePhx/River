import { NotificationEntity } from '@/notification/domain/notification.entity';

export interface RealtimeNotifierPort {
  notifyUser(userId: string, notification: NotificationEntity): Promise<void>;
}
