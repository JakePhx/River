import { IsString } from "class-validator";

export class CreatePostBodyDTO {
  @IsString()
  content!: string;
}
