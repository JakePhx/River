import {
  IsArray,
  IsDate,
  IsObject,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

import { UserResponseDTO } from "../user/user.response.dto";
import { ErrorResponseDTO } from "../error.response.dto";
import { PostAttachmentResponseDTO } from "./post-attachment.response.dto";

export class PostResponseDTO {
  @IsString()
  id!: string;
  @IsString()
  authorId!: string;
  @IsString()
  content!: string;
  @IsDate()
  createdAt!: Date;
  @IsDate()
  updatedAt!: Date;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostAttachmentResponseDTO)
  attachments!: PostAttachmentResponseDTO[];
  @IsObject()
  @ValidateNested()
  @Type(() => UserResponseDTO)
  author!: UserResponseDTO;
}

export class PostErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
