import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FollowService } from '../../../application/follow/follow.service';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly follow: FollowService) {}

  @Post()
  followUser(@Req() req: any, @Body() body: { targetUserId: string }) {
    return this.follow.follow(req.user.userId, body.targetUserId);
  }

  @Delete()
  unfollowUser(@Req() req: any, @Body() body: { targetUserId: string }) {
    return this.follow.unfollow(req.user.userId, body.targetUserId);
  }

  @Post('requests/cancel')
  cancel(@Req() req: any, @Body() body: { targetUserId: string }) {
    return this.follow.cancelRequest(req.user.userId, body.targetUserId);
  }

  @Post('requests/accept')
  accept(@Req() req: any, @Body() body: { requesterId: string }) {
    return this.follow.acceptRequest(req.user.userId, body.requesterId);
  }

  @Post('requests/reject')
  reject(@Req() req: any, @Body() body: { requesterId: string }) {
    return this.follow.rejectRequest(req.user.userId, body.requesterId);
  }
}
