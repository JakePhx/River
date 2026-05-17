import { IsEnum, IsInt, IsString, IsUrl, Min } from "class-validator";

export enum CreatePostAttachmentKindDTO {
  image = "image",
  video = "video",
}

export class CreatePostAttachmentBodyDTO {
  @IsUrl({ require_tld: false, require_protocol: true })
  url!: string;

  @IsString()
  contentType!: string;

  @IsInt()
  @Min(0)
  byteSize!: number;

  @IsEnum(CreatePostAttachmentKindDTO)
  kind!: CreatePostAttachmentKindDTO;
}
