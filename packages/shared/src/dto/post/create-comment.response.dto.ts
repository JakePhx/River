import { IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { ErrorResponseDTO } from "../error.response.dto";
import { CommentResponseDTO } from "./comment.response.dto";

export class CreateCommentResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => CommentResponseDTO)
  comment!: CommentResponseDTO;
}

export class CreateCommentErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
