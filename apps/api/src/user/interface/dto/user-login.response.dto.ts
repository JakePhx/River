export type UserLoginResponseDTO = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
  };
};

export type UserLoginErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};
