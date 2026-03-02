import { IsEmail, IsString } from "class-validator";

export class UserRegisterBodyDTO {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  username!: string;

  @IsString()
  password!: string;
}
