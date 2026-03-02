import { IsString } from "class-validator";

export class UserLoginBodyDTO {
  @IsString()
  usernameOrEmail!: string;

  @IsString()
  password!: string;
}
