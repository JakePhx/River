import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@/_shared/application/tokens';

// Ports
import type { FollowRepoPort } from '../ports/follow.repo.port';
import type { FollowRequestRepoPort } from '../ports/follow-request.repo.port';
import type { UserRepoPort } from '@/user/application/port/user.repo.port';
import type { FollowEventPublisherPort } from '@/follow/application/port/follow-event.publisher.port';

// Errors
import { UserNotFoundError } from '@/user/domain/errors';
import {
  AlreadyFollowedError,
  FollowRequestNotFoundError,
} from '@/follow/domain/errors';

// Entities, Value Objects, && DTOs
import { FollowEntity } from '@/follow/domain/follow.entity';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import { AcceptFollowBodyDTO, AcceptFollowResponseDTO } from '@social/shared';

@Injectable()
export class AcceptFollowUseCase {
  constructor(
    @Inject(TOKENS.FOLLOW_REPO)
    private readonly followRepo: FollowRepoPort,
    @Inject(TOKENS.FOLLOW_REQUEST_REPO)
    private readonly followRequestRepo: FollowRequestRepoPort,
    @Inject(TOKENS.USER_REPO)
    private readonly userRepo: UserRepoPort,
    @Inject(TOKENS.FOLLOW_EVENT_PUBLISHER)
    private readonly followEventPublisher: FollowEventPublisherPort,
  ) {}

  async execute(
    accepterId: UserId,
    input: AcceptFollowBodyDTO,
  ): Promise<AcceptFollowResponseDTO> {
    const requesterId = UserId.from(input.requesterId);

    const requester = await this.userRepo.findById(requesterId);
    if (!requester) throw new UserNotFoundError();

    const accepter = await this.userRepo.findById(accepterId);
    if (!accepter) throw new UserNotFoundError();

    const followRequest =
      await this.followRequestRepo.findFollowRequestByRequesterIdAndRequestedId(
        requesterId,
        accepterId,
      );
    if (!followRequest) throw new FollowRequestNotFoundError();

    let follow = await this.followRepo.findFollowByFollowerIdAndFollowingId(
      requesterId,
      accepterId,
    );

    if (follow) throw new AlreadyFollowedError();

    follow = FollowEntity.create({
      followerId: requesterId,
      followingId: accepterId,
    });

    await this.followRepo.create(follow);
    await this.followRequestRepo.delete(followRequest);

    await this.followEventPublisher.publishFollowRequestAccepted({
      requesterId: requesterId.toString(),
      accepterId: accepterId.toString(),
      redirectURL: `/u/${encodeURIComponent(accepter.username.toString())}`,
    });

    return { ok: true };
  }
}
