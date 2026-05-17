import type {
  Notification,
  NotificationListApiItem,
  NotificationTypeId,
} from "./notification.types";

export const NotificationMapper = {
  fromApi(row: NotificationListApiItem): Notification {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type as NotificationTypeId,
      payload: row.payload as Notification["payload"],
      isRead: row.isRead,
      eventId: row.eventId,
      processedAt: row.processedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },
};
