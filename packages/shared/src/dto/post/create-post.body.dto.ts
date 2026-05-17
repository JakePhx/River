import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";

import { CreatePostAttachmentBodyDTO } from "./create-post-attachment.body.dto";

export class CreatePostBodyDTO {
  /** May be empty when `attachments` is non-empty; server enforces at least one of text or attachments. */
  @IsString()
  @MaxLength(280)
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => CreatePostAttachmentBodyDTO)
  attachments?: CreatePostAttachmentBodyDTO[];
}
