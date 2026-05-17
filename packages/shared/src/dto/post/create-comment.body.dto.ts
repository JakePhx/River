import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommentBodyDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(280)
  content!: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}
