import { IsString } from "class-validator";

export class ErrorResponseDTO {
  @IsString()
  code!: string;

  @IsString()
  message!: string;
}
