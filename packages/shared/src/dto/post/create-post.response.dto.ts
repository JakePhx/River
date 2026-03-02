import { IsBoolean, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { ErrorResponseDTO } from "../error.response.dto.js";
import { PostResponseDTO } from "./post.response.dto.js";

export class CreatePostResponseDTO {
  @IsBoolean()
  ok!: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => PostResponseDTO)
  post!: PostResponseDTO;
}

export class CreatePostErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
