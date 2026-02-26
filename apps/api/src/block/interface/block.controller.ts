import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';
import { BlockTargetBodyDTO } from './dto/block-target.body.dto';
import { BlockUserUseCase } from '../application/usecase/block-user.usecase';
import { UnblockUserUseCase } from '../application/usecase/unblock-user.usecase';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(
    private readonly blockUser: BlockUserUseCase,
    private readonly unBlockUser: UnblockUserUseCase,
  ) {}

  @Post()
  block(@Req() req: any, @Body() dto: BlockTargetBodyDTO) {
    return this.blockUser.execute(req.user.userId, dto);
  }

  @Delete()
  unblock(@Req() req: any, @Body() dto: BlockTargetBodyDTO) {
    return this.unBlockUser.execute(req.user.userId, dto);
  }
}
