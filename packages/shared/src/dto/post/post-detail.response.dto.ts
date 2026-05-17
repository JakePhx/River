import { IsArray, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { CommentResponseDTO } from "./comment.response.dto";
import { PostResponseDTO } from "./post.response.dto";

export class GetPostDetailResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => PostResponseDTO)
  post!: PostResponseDTO;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentResponseDTO)
  comments!: CommentResponseDTO[];
}
