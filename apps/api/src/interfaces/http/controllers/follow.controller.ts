import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FollowTargetDtoClass } from '../../../application/follow/dto/follow-target.dto';
import { FollowRequestDecisionDtoClass } from '../../../application/follow/dto/follow-request-decision.dto';
import { FollowUserUseCase } from '../../../application/follow/use-cases/follow-user.usecase';
import { UnfollowUserUseCase } from '../../../application/follow/use-cases/unfollow-user.usecase';
import { CancelFollowRequestUseCase } from '../../../application/follow/use-cases/cancel-follow-request.usecase';
import { AcceptFollowRequestUseCase } from '../../../application/follow/use-cases/accept-follow-request.usecase';
import { RejectFollowRequestUseCase } from '../../../application/follow/use-cases/reject-follow-request.usecase';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(
    private readonly followUser: FollowUserUseCase,
    private readonly unfollowUser: UnfollowUserUseCase,
    private readonly cancelReq: CancelFollowRequestUseCase,
    private readonly acceptReq: AcceptFollowRequestUseCase,
    private readonly rejectReq: RejectFollowRequestUseCase,
  ) {}

  @Post()
  follow(@Req() req: any, @Body() dto: FollowTargetDtoClass) {
    const input = { targetUserId: dto.targetUserId };
    return this.followUser.execute(req.user.userId, input);
  }

  @Delete()
  unfollow(@Req() req: any, @Body() dto: FollowTargetDtoClass) {
    const input = { targetUserId: dto.targetUserId };
    return this.unfollowUser.execute(req.user.userId, input);
  }

  @Post('requests/cancel')
  cancel(@Req() req: any, @Body() dto: FollowTargetDtoClass) {
    const input = { targetUserId: dto.targetUserId };
    return this.cancelReq.execute(req.user.userId, input);
  }

  @Post('requests/accept')
  accept(@Req() req: any, @Body() dto: FollowRequestDecisionDtoClass) {
    const input = { requesterId: dto.requesterId };
    return this.acceptReq.execute(req.user.userId, input);
  }

  @Post('requests/reject')
  reject(@Req() req: any, @Body() dto: FollowRequestDecisionDtoClass) {
    const input = { requesterId: dto.requesterId };
    return this.rejectReq.execute(req.user.userId, input);
  }
}
