import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../../../application/user/user.service';
import { UpdatePrivacyDto } from '../../../application/user/dto/update-privacy.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.users.me(req.user.userId);
  }

  @Patch('me/privacy')
  privacy(@Req() req: any, @Body() dto: UpdatePrivacyDto) {
    return this.users.updatePrivacy(req.user.userId, dto.isPrivate);
  }
}
