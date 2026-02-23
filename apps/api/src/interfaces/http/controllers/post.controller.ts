import {
  Body,
  Controller,
  Get,
  Post as HttpPost,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { CreatePostDtoClass } from '../../../application/post/dto/create-post.dto';
import { CreatePostUseCase } from 'src/application/post/use-cases/create-post.usecase';
import { GetFeedUseCase } from 'src/application/post/use-cases/get-feed.usecase';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly createPost: CreatePostUseCase,
    private readonly getFeed: GetFeedUseCase,
  ) {}

  @HttpPost()
  create(@Req() req: any, @Body() dto: CreatePostDtoClass) {
    const input = { content: dto.content };
    return this.createPost.execute(req.user.userId, input);
  }

  @Get('feed')
  feed(@Req() req: any) {
    return this.getFeed.execute(req.user.userId);
  }
}
