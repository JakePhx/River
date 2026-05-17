import { IsBoolean, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { PostResponseDTO } from "./post.response.dto";

export class UpdatePostResponseDTO {
  @IsBoolean()
  ok!: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => PostResponseDTO)
  post!: PostResponseDTO;
}
