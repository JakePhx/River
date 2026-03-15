import { Inject, Injectable, Logger } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Ports
import type { NotificationRepoPort } from '../port/notification.repo.port';
import type { RealtimeNotifierPort } from '../port/realtime.notifier';
import type { FollowRepoPort } from '@/follow/application/ports/follow.repo.port';
import type { UserRepoPort } from '@/user/application/port/user.repo.port';

// Entities, Value Objects, && DTOs
import { NotificationEntity } from '@/notification/domain/notification.entity';
import { NotificationType } from '@/notification/domain/notification-type.enum';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { UserNotFoundError } from '@/user/domain/errors';

@Injectable()
export class CreatePostNotificationsUseCase {
  private readonly logger = new Logger(CreatePostNotificationsUseCase.name);

  constructor(
    @Inject(TOKENS.NOTIFICATION_REPO)
    private readonly notificationRepo: NotificationRepoPort,
    @Inject(TOKENS.FOLLOW_REPO)
    private readonly followRepo: FollowRepoPort,
    @Inject(TOKENS.NOTIFICATION_WS_SERVICE)
    private readonly realtimeNotifier: RealtimeNotifierPort,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepoPort,
  ) {}

  async execute(params: { postId: string; authorId: string }): Promise<void> {
    const { postId, authorId } = params;
    const authorUserId = UserId.from(authorId);

    const author = await this.userRepo.findById(authorUserId);
    if (!author) {
      throw new UserNotFoundError();
    }

    const followers = await this.followRepo.listAllFollowers(authorUserId);

    if (!followers.length) {
      this.logger.debug(`No followers found for author ${authorId}`);
      return;
    }

    const notifications = followers
      .filter((follower) => follower.id !== authorUserId)
      .map((follower) =>
        NotificationEntity.create({
          userId: follower.id.toString(),
          type: NotificationType.POST_CREATED,
          payload: { postId },
          //Todo: add eventId
          eventId: '',
        }),
      );

    if (!notifications.length) return;

    await this.notificationRepo.createMany(notifications);

    await Promise.allSettled(
      notifications.map((notification) =>
        this.realtimeNotifier.notifyUser(notification.userId, notification),
      ),
    );
  }
}
