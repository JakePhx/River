import { IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { UserResponseDTO } from "./user.response.dto.js";
import { ErrorResponseDTO } from "../error.response.dto.js";

export class UserRegisterResponseDTO {
  @IsString()
  accessToken!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UserResponseDTO)
  user!: UserResponseDTO;
}

export class UserRegisterErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
