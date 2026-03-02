import { IsString } from "class-validator";

export class AcceptFollowBodyDTO {
  @IsString()
  requesterId!: string;
}

export class RejectFollowBodyDTO {
  @IsString()
  requesterId!: string;
}
