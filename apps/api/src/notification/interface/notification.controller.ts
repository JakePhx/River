// src/notification/interface/notification.controller.ts
import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';

import { GetNotificationsUseCase } from '@/notification/application/usecase/get-notifications.usecase';
import { MarkNotificationReadUseCase } from '@/notification/application/usecase/mark-notification-read.usecase';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
  ) {}

  @Get()
  async getMyNotifications(@Req() req: any) {
    return this.getNotificationsUseCase.execute(req.user.userId.toString());
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId.toString();

    await this.markNotificationReadUseCase.execute({
      notificationId: id,
      userId,
    });

    return { ok: true };
  }
}
