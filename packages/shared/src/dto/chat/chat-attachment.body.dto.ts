import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

/** 100 MiB — must match API enforcement. */
export const CHAT_ATTACHMENT_MAX_BYTES = 100 * 1024 * 1024;

export class ChatMessageAttachmentBodyDTO {
  @IsString()
  @MaxLength(2048)
  url!: string;

  @IsString()
  @MaxLength(255)
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(CHAT_ATTACHMENT_MAX_BYTES)
  byteSize!: number;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  fileName?: string;
}
