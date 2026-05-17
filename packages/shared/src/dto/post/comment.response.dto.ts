import { IsDate, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { UserResponseDTO } from "../user/user.response.dto";

export class CommentResponseDTO {
  @IsString()
  id!: string;

  @IsString()
  postId!: string;

  @IsString()
  authorId!: string;

  @IsOptional()
  @IsString()
  parentCommentId!: string | null;

  @IsString()
  content!: string;

  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date;

  @IsObject()
  @ValidateNested()
  @Type(() => UserResponseDTO)
  author!: UserResponseDTO;
}
