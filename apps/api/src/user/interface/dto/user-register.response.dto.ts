export type UserRegisterResponseDTO = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
  };
};

export type UserRegisterErrorResponseDTO = {
  error: {
    code: string;
    message: string;
  };
};
