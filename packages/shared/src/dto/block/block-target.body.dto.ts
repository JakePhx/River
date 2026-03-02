import { IsString } from "class-validator";

export class BlockTargetBodyDTO {
  @IsString()
  targetId!: string;
}

export class UnBlockTargetBodyDTO {
  @IsString()
  targetId!: string;
}
