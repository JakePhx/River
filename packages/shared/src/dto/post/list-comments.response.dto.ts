import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { CommentResponseDTO } from "./comment.response.dto";

export class ListCommentsResponseDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentResponseDTO)
  comments!: CommentResponseDTO[];
}
