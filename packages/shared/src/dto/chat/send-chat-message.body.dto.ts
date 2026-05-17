import { Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

import { ChatMessageAttachmentBodyDTO } from "./chat-attachment.body.dto";

export class SendChatMessageBodyDTO {
  @IsString()
  recipientId!: string;

  /** May be empty when `attachment` is set; server requires text and/or attachment. */
  @IsString()
  @MaxLength(8000)
  content!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatMessageAttachmentBodyDTO)
  attachment?: ChatMessageAttachmentBodyDTO;

  /** Must belong to the same thread as this send (after thread is resolved). */
  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;
}
