import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';

// Use Cases
import { GetByUserNameUseCase } from '@/user/application/usecase/get-by-username.usecase';
import { GetMeUseCase } from '@/user/application/usecase/get-me.usecase';
import { GetByIdUseCase } from '@/user/application/usecase/get-by-id.usecase';
import { ListUserUseCase } from '@/user/application/usecase/list-user.usecase';
import { UpdateMyProfileUseCase } from '@/user/application/usecase/update-my-profile.usecase';
import { GetUserPostsUseCase } from '@/post/application/usecase/get-user-posts.usecase';
import { ListFollowersUseCase } from '@/follow/application/usecase/list-followers.usecase';
import { ListFollowingUseCase } from '@/follow/application/usecase/list-following.usecase';

// Entities, Value Objects, && DTOs
import { Username } from '@/user/domain/value-object/username.vo';
import { UserId } from '@/user/domain/value-object/user-id.vo';
import {
  ListUserResponseDTO,
  UpdateProfileBodyDTO,
  UserResponseDTO,
  ListPostResponseDTO,
} from '@social/shared';

@Controller('users')
export class UserController {
  constructor(
    private readonly getMe: GetMeUseCase,
    private readonly getUserByUsername: GetByUserNameUseCase,
    private readonly getUserById: GetByIdUseCase,
    private readonly listUsers: ListUserUseCase,
    private readonly updateMyProfile: UpdateMyProfileUseCase,
    private readonly getUserPosts: GetUserPostsUseCase,
    private readonly listFollowers: ListFollowersUseCase,
    private readonly listFollowing: ListFollowingUseCase,
  ) {}

  @Get('search')
  search(
    @Query('query') query: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ): Promise<ListUserResponseDTO> {
    return this.listUsers.execute(
      {
        cursor,
        take: take ? parseInt(take, 10) : 10,
      },
      query,
    );
  }

  @Get('by-username/:username')
  byUsername(@Param('username') username: string): Promise<UserResponseDTO> {
    const urname = Username.create(username);
    return this.getUserByUsername.execute(urname);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any): Promise<UserResponseDTO> {
    return this.getMe.execute(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  updateMe(
    @Req() req: any,
    @Body() dto: UpdateProfileBodyDTO,
  ): Promise<UserResponseDTO> {
    return this.updateMyProfile.execute(req.user.userId, dto);
  }

  @Get(':userId/posts')
  posts(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ): Promise<ListPostResponseDTO> {
    return this.getUserPosts.execute(UserId.from(userId), {
      cursor,
      take: take ? parseInt(take, 10) : 10,
    });
  }

  @Get(':userId/followers')
  followers(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ): Promise<ListUserResponseDTO> {
    return this.listFollowers.execute(UserId.from(userId), {
      cursor,
      take: take ? parseInt(take, 10) : 10,
    });
  }

  @Get(':userId/following')
  following(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ): Promise<ListUserResponseDTO> {
    return this.listFollowing.execute(UserId.from(userId), {
      cursor,
      take: take ? parseInt(take, 10) : 10,
    });
  }

  @Get(':userId')
  byId(@Param('userId') userId: string) {
    return this.getUserById.execute(UserId.from(userId));
  }
}
