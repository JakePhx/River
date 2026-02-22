import {
  Body,
  Controller,
  Get,
  Post as HttpPost,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PostService } from '../../../application/post/post.service';
import { CreatePostDto } from '../../../application/post/dto/create-post.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly posts: PostService) {}

  @HttpPost()
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.posts.create(req.user.userId, dto.content);
  }

  @Get('feed')
  feed(@Req() req: any) {
    return this.posts.feed(req.user.userId);
  }
}
