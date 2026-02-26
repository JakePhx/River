import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';
import type {
  CancelFollowBodyDTO,
  FollowTargetBodyDTO,
  UnFollowTargetBodyDTO,
} from './dto/follow-target.body.dto';
import type {
  AcceptFollowBodyDTO,
  RejectFollowBodyDTO,
} from './dto/accept-follow.body.dto';
import { FollowUserUseCase } from '../application/usecase/follow-user.usecase';
import { UnfollowUserUseCase } from '../application/usecase/unfollow-user.usecase';
import { CancelFollowUseCase } from '../application/usecase/cancel-follow.usecase';
import { AcceptFollowUseCase } from '../application/usecase/accept-follow.usecase';
import { RejectFollowUseCase } from '../application/usecase/reject-follow.usecase';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(
    private readonly followUser: FollowUserUseCase,
    private readonly unfollowUser: UnfollowUserUseCase,
    private readonly cancelReq: CancelFollowUseCase,
    private readonly acceptReq: AcceptFollowUseCase,
    private readonly rejectReq: RejectFollowUseCase,
  ) {}

  @Post()
  follow(@Req() req: any, @Body() dto: FollowTargetBodyDTO) {
    const input = { targetUserId: dto.targetUserId };
    return this.followUser.execute(req.user.userId, input);
  }

  @Delete()
  unfollow(@Req() req: any, @Body() dto: UnFollowTargetBodyDTO) {
    const input = { targetUserId: dto.targetUserId };
    return this.unfollowUser.execute(req.user.userId, input);
  }

  @Post('requests/cancel')
  cancel(@Req() req: any, @Body() dto: CancelFollowBodyDTO) {
    const input = { targetUserId: dto.targetUserId };
    return this.cancelReq.execute(req.user.userId, input);
  }

  @Post('requests/accept')
  accept(@Req() req: any, @Body() dto: AcceptFollowBodyDTO) {
    const input = { requesterId: dto.requesterId };
    return this.acceptReq.execute(req.user.userId, input);
  }

  @Post('requests/reject')
  reject(@Req() req: any, @Body() dto: RejectFollowBodyDTO) {
    const input = { requesterId: dto.requesterId };
    return this.rejectReq.execute(req.user.userId, input);
  }
}
