// src/notification/interface/notification.controller.ts
import { Controller, Get, Inject, Patch, Param, Req } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Ports
import type { GetNotificationsUseCase } from '@/notification/application/usecase/get-notifications.usecase';
import type { NotificationRepoPort } from '@/notification/application/port/notification.repo.port';
import { MarkNotificationReadUseCase } from '@/notification/application/usecase/mark-notification-read.usecase';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
  ) {}

  @Get()
  async getMyNotifications(@Req() req: any) {
    return this.getNotificationsUseCase.execute(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;

    await this.markNotificationReadUseCase.execute({
      notificationId: id,
      userId,
    });

    return { ok: true };
  }
}
