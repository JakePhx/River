// src/notification/domain/notification.entity.ts
import { randomUUID } from 'crypto';
import { NotificationType } from './notification-type.enum';

export class NotificationEntity {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly payload: Record<string, any>,
    public isRead: boolean,
    public readonly eventId: string,
    public processedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: {
    userId: string;
    type: NotificationType;
    payload: Record<string, any>;
    eventId: string;
  }): NotificationEntity {
    return new NotificationEntity(
      randomUUID(),
      params.userId,
      params.type,
      params.payload,
      false,
      params.eventId,
      null,
      new Date(),
      new Date(),
    );
  }

  static rehydrate(props: {
    id: string;
    userId: string;
    type: NotificationType;
    payload: Record<string, any>;
    isRead: boolean;
    eventId: string;
    processedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): NotificationEntity {
    return new NotificationEntity(
      props.id,
      props.userId,
      props.type,
      props.payload,
      props.isRead,
      props.eventId,
      props.processedAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  update(props: { isRead: boolean }) {
    this.isRead = props.isRead;
    this.processedAt = new Date();
    this.updatedAt = new Date();
  }
}
