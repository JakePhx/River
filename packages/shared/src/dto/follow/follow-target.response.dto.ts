import { IsBoolean, IsEnum, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { ErrorResponseDTO } from "../error.response.dto";

export enum FollowTargetStatus {
  FOLLOWING = "FOLLOWING",
  REQUESTED = "REQUESTED",
}

export class FollowTargetResponseDTO {
  @IsBoolean()
  ok!: boolean;
  @IsEnum(FollowTargetStatus)
  status!: FollowTargetStatus;
}

export class UnFollowTargetResponseDTO {
  @IsBoolean()
  ok!: boolean;
}

export class CancelFollowResponseDTO {
  @IsBoolean()
  ok!: boolean;
}

export class FollowTargetErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}

export class UnFollowTargetErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  @IsBoolean()
  error!: ErrorResponseDTO;
}

export class CancelFollowErrorResponseDTO {
  @IsObject()
  @ValidateNested()
  @Type(() => ErrorResponseDTO)
  error!: ErrorResponseDTO;
}
