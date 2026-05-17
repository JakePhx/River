import { IsString, MinLength } from "class-validator";

export class UpdatePostBodyDTO {
  @IsString()
  @MinLength(1)
  content!: string;
}
