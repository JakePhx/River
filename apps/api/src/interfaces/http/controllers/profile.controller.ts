import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateProfileDtoClass } from '../../../application/profile/dto/update-profile.dto';
import { GetProfileUseCase } from 'src/application/profile/use-cases/get-profile.usecase';
import { UpdateProfileUseCase } from 'src/application/profile/use-cases/update-profile.usecase';

@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly getProfile: GetProfileUseCase,
    private readonly updateProfile: UpdateProfileUseCase,
  ) {}

  // viewer optional: if no token, only public users are visible.
  // For simplicity, keep it public endpoint and pass viewerId=null when no auth.
  @Get(':userId')
  get(@Req() req: any, @Param('userId') userId: string) {
    const viewerId = req.user?.userId ?? null;
    return this.getProfile.execute(viewerId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateProfileDtoClass) {
    const input = { name: dto.name, avatarUrl: dto.avatarUrl };
    return this.updateProfile.execute(req.user.userId, input);
  }
}
