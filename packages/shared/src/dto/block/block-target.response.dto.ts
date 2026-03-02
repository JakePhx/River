import { Type } from "class-transformer";
import { IsBoolean, IsObject, ValidateNested } from "class-validator";

import { ErrorResponseDTO } from "../error.response.dto.js";

export class BlockTargetResponseDTO {
  @IsBoolean()
  ok!: boolean;
}

export class UnBlockTargetResponseDTO {
  @IsBoolean()
  ok!: boolean;
}

export class BlockTargetErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}

export class UnBlockTargetErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
