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
import { ProfileService } from '../../../application/profile/profile.service';
import { UpdateProfileDto } from '../../../application/profile/dto/update-profile.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  // viewer optional: if no token, only public users are visible.
  // For simplicity, keep it public endpoint and pass viewerId=null when no auth.
  @Get(':userId')
  get(@Req() req: any, @Param('userId') userId: string) {
    const viewerId = req.user?.userId ?? null;
    return this.profiles.getProfile(viewerId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profiles.updateMyProfile(req.user.userId, dto);
  }
}
