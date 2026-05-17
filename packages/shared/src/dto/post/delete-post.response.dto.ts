import { IsBoolean, IsString } from "class-validator";

export class DeletePostResponseDTO {
  @IsBoolean()
  ok!: boolean;

  @IsString()
  postId!: string;

  @IsString()
  authorId!: string;
}
