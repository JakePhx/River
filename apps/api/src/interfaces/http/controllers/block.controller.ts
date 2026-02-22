import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { BlockService } from '../../../application/block/block.service';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(private readonly blocks: BlockService) {}

  @Post()
  block(@Req() req: any, @Body() body: { targetUserId: string }) {
    return this.blocks.block(req.user.userId, body.targetUserId);
  }

  @Delete()
  unblock(@Req() req: any, @Body() body: { targetUserId: string }) {
    return this.blocks.unblock(req.user.userId, body.targetUserId);
  }
}
