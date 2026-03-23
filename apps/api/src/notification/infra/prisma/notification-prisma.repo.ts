import { Injectable } from '@nestjs/common';

// Ports
import { PrismaService } from '@/_shared/infra/prisma/prisma.service';
import type { NotificationRepoPort } from '@/notification/application/port/notification.repo.port';

// Entities, Value Objects, && DTOs
import { NotificationEntity } from '@/notification/domain/notification.entity';
import { NotificationType } from '@/notification/domain/notification-type.enum';
import { UserId } from '@/user/domain/value-object/user-id.vo';

@Injectable()
export class NotificationPrismaRepo implements NotificationRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(notifications: NotificationEntity[]): Promise<void> {
    if (!notifications.length) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.createMany({
        data: notifications.map((notification) => ({
          id: notification.id,
          userId: notification.userId,
          type: notification.type,
          payload: notification.payload,
          isRead: notification.isRead,
          eventId: notification.eventId,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        })),
      });

      await tx.user.updateMany({
        where: {
          id: { in: notifications.map((notification) => notification.userId) },
        },
        data: {
          hasUnreadNotifications: true,
        },
      });
    });
  }

  async findByUserId(userId: UserId): Promise<NotificationEntity[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId: userId.toString() },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) =>
      NotificationEntity.rehydrate({
        id: row.id,
        userId: row.userId,
        type: row.type as NotificationType,
        payload: row.payload as Record<string, any>,
        isRead: row.isRead,
        eventId: row.eventId,
        processedAt: row.processedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const row = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!row) return null;

    return NotificationEntity.rehydrate({
      id: row.id,
      userId: row.userId,
      type: row.type as NotificationType,
      payload: row.payload as Record<string, any>,
      isRead: row.isRead,
      eventId: row.eventId,
      processedAt: row.processedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async update(notification: NotificationEntity): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        isRead: notification.isRead,
        processedAt: notification.processedAt,
        updatedAt: notification.updatedAt,
      },
    });
  }
}
