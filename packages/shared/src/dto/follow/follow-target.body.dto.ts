import { IsString } from "class-validator";

export class FollowTargetBodyDTO {
  @IsString()
  targetUserId!: string;
}

export class UnFollowTargetBodyDTO {
  @IsString()
  targetUserId!: string;
}

export class CancelFollowBodyDTO {
  @IsString()
  targetUserId!: string;
}
