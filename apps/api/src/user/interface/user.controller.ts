import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';

import { GetByUserNameUseCase } from '../application/usecase/get-by-username.usecase';
import { GetMeUseCase } from '../application/usecase/get-me.usecase';
import { ListUserUseCase } from '../application/usecase/list-user.usecase';

@Controller('users')
export class UserController {
  constructor(
    private readonly getMe: GetMeUseCase,
    private readonly getUserByUsername: GetByUserNameUseCase,
    private readonly listUsers: ListUserUseCase,
  ) {}

  @Get('search')
  search(
    @Query('query') query: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.listUsers.execute(
      query || '',
      cursor,
      take ? parseInt(take, 10) : undefined,
    );
  }

  @Get('by-username/:username')
  byUsername(@Param('username') username: string) {
    return this.getUserByUsername.execute(username);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.getMe.execute(req.user.userId);
  }
}
