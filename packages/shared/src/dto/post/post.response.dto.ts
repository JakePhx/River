import { IsDate, IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { UserResponseDTO } from "../user/user.response.dto";

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
  @IsObject()
  @ValidateNested()
  @Type(() => UserResponseDTO)
  author!: UserResponseDTO;
}
