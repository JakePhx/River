import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { BlockTargetDtoClass } from '../../../application/block/dto/block-target.dto';
import { BlockUserUseCase } from 'src/application/block/use-cases/block-user.usecase';
import { UnblockUserUseCase } from 'src/application/block/use-cases/unblock-user.usecase';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(
    private readonly blockUser: BlockUserUseCase,
    private readonly unBlockUser: UnblockUserUseCase,
  ) {}

  @Post()
  block(@Req() req: any, @Body() dto: BlockTargetDtoClass) {
    const input = { targetUserId: dto.targetUserId };
    return this.blockUser.execute(req.user.userId, input);
  }

  @Delete()
  unblock(@Req() req: any, @Body() dto: BlockTargetDtoClass) {
    const input = { targetUserId: dto.targetUserId };
    return this.unBlockUser.execute(req.user.userId, input);
  }
}
