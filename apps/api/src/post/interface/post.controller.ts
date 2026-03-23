import {
  Body,
  Controller,
  Get,
  Post as HttpPost,
  Logger,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';

// Use Cases
import { CreatePostUseCase } from '../application/usecase/create-post.usecase';
import { GetFeedUseCase } from '../application/usecase/get-feed.usecase';

// DTOs
import {
  CreatePostBodyDTO,
  CreatePostResponseDTO,
  ListPostResponseDTO,
} from '@social/shared';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly createPost: CreatePostUseCase,
    private readonly getFeed: GetFeedUseCase,
  ) {}

  @HttpPost()
  create(
    @Req() req: any,
    @Body() dto: CreatePostBodyDTO,
  ): Promise<CreatePostResponseDTO> {
    return this.createPost.execute(req.user.userId, dto);
  }

  @Get('feed')
  feed(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ): Promise<ListPostResponseDTO> {
    return this.getFeed.execute(req.user.userId, {
      cursor,
      take: take ? parseInt(take, 10) : 10,
    });
  }
}
