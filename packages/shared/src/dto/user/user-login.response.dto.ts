import { IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { UserResponseDTO } from "./user.response.dto";
import { ErrorResponseDTO } from "../error.response.dto";

export class UserLoginResponseDTO {
  @IsString()
  accessToken!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UserResponseDTO)
  user!: UserResponseDTO;
}

export class UserLoginErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
