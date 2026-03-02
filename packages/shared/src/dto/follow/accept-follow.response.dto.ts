import { IsBoolean, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { ErrorResponseDTO } from "../error.response.dto.js";

export class AcceptFollowResponseDTO {
  @IsBoolean()
  ok!: boolean;
}

export class RejectFollowResponseDTO {
  @IsBoolean()
  ok!: boolean;
}

export class AcceptFollowErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}

export class RejectFollowErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
