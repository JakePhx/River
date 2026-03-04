import type { Role, UserId } from "./common";

// DTOs (request body - used only at controller layer)
export type RegisterDto = {
  email: string;
  username: string;
  password: string;
};

export type LoginDto = {
  usernameOrEmail: string;
  password: string;
};

// Response (API output)
export type AuthUserRes = {
  id: UserId;
  email: string;
  username: string;
  role: Role;
};

export type AuthRes = {
  user: AuthUserRes;
  accessToken: string;
};
