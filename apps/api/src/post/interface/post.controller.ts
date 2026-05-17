import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post as HttpPost,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/_shared/interface/guards/jwt-auth.guard';

// Use Cases
import { CreatePostUseCase } from '../application/usecase/create-post.usecase';
import { GetFeedUseCase } from '../application/usecase/get-feed.usecase';
import { GetPostDetailUseCase } from '../application/usecase/get-post-detail.usecase';
import { CreateCommentUseCase } from '../application/usecase/create-comment.usecase';
import { ListCommentsForPostUseCase } from '../application/usecase/list-comments-for-post.usecase';
import { UpdatePostUseCase } from '../application/usecase/update-post.usecase';
import { DeletePostUseCase } from '../application/usecase/delete-post.usecase';

// DTOs
import {
  CreateCommentBodyDTO,
  CreateCommentResponseDTO,
  CreatePostBodyDTO,
  CreatePostResponseDTO,
  DeletePostResponseDTO,
  GetPostDetailResponseDTO,
  ListCommentsResponseDTO,
  ListPostResponseDTO,
  UpdatePostBodyDTO,
  UpdatePostResponseDTO,
} from '@social/shared';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly createPost: CreatePostUseCase,
    private readonly getFeed: GetFeedUseCase,
    private readonly getPostDetail: GetPostDetailUseCase,
    private readonly createComment: CreateCommentUseCase,
    private readonly listCommentsForPost: ListCommentsForPostUseCase,
    private readonly updatePost: UpdatePostUseCase,
    private readonly deletePost: DeletePostUseCase,
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

  @HttpPost(':postId/comments')
  addComment(
    @Req() req: any,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentBodyDTO,
  ): Promise<CreateCommentResponseDTO> {
    return this.createComment.execute(req.user.userId, postId, dto);
  }

  @Get(':postId/comments')
  listComments(
    @Param('postId') postId: string,
  ): Promise<ListCommentsResponseDTO> {
    return this.listCommentsForPost.execute(postId);
  }

  @Patch(':postId')
  patch(
    @Req() req: any,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostBodyDTO,
  ): Promise<UpdatePostResponseDTO> {
    return this.updatePost.execute(req.user.userId, postId, dto);
  }

  @Delete(':postId')
  remove(
    @Req() req: any,
    @Param('postId') postId: string,
  ): Promise<DeletePostResponseDTO> {
    return this.deletePost.execute(req.user.userId, postId);
  }

  @Get(':postId')
  getOne(
    @Req() req: any,
    @Param('postId') postId: string,
  ): Promise<GetPostDetailResponseDTO> {
    return this.getPostDetail.execute(req.user.userId, postId);
  }
}
