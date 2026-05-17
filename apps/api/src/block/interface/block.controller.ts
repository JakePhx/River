import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';

// Use Cases
import { BlockUserUseCase } from '../application/usecase/block-user.usecase';
import { UnblockUserUseCase } from '../application/usecase/unblock-user.usecase';
import { ListBlockedUsersUseCase } from '../application/usecase/list-blocked-users.usecase';

// DTOs
import {
  BlockTargetBodyDTO,
  ListUserResponseDTO,
  UnBlockTargetBodyDTO,
} from '@social/shared';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(
    private readonly blockUser: BlockUserUseCase,
    private readonly unBlockUser: UnblockUserUseCase,
    private readonly listBlockedUsers: ListBlockedUsersUseCase,
  ) {}

  @Get()
  listMine(@Req() req: any): Promise<ListUserResponseDTO> {
    return this.listBlockedUsers.execute(req.user.userId);
  }

  @Post()
  block(@Req() req: any, @Body() dto: BlockTargetBodyDTO) {
    return this.blockUser.execute(req.user.userId, dto);
  }

  @Delete()
  unblock(@Req() req: any, @Body() dto: UnBlockTargetBodyDTO) {
    return this.unBlockUser.execute(req.user.userId, dto);
  }
}
