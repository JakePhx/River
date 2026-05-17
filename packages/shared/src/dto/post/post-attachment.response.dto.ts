import { IsIn, IsInt, IsString, Min } from "class-validator";

export class PostAttachmentResponseDTO {
  @IsString()
  id!: string;

  @IsString()
  url!: string;

  @IsString()
  contentType!: string;

  @IsInt()
  @Min(0)
  byteSize!: number;

  @IsIn(["image", "video"])
  kind!: "image" | "video";
}
