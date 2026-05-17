import { IsString, MaxLength } from "class-validator";

export class UpdateChatMessageBodyDTO {
  @IsString()
  @MaxLength(8000)
  content!: string;
}
