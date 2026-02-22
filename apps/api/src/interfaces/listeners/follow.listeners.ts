import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FollowEvents,
  type FollowedPayload,
  type UnfollowedPayload,
} from '../../domain/events/follow.events';

@Injectable()
export class FollowListeners {
  private readonly logger = new Logger(FollowListeners.name);

  @OnEvent(FollowEvents.Followed)
  onFollowed(payload: FollowedPayload) {
    this.logger.log(
      `User ${payload.followerId} followed ${payload.followingId}`,
    );
    // later: send notification, push to Kafka, update counters, etc.
  }

  @OnEvent(FollowEvents.Unfollowed)
  onUnfollowed(payload: UnfollowedPayload) {
    this.logger.log(
      `User ${payload.followerId} unfollowed ${payload.followingId}`,
    );
  }
}
