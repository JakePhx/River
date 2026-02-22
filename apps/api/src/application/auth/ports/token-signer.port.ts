export interface TokenSignerPort {
  signAccessToken(payload: {
    sub: string;
    username: string;
    role: 'USER' | 'ADMIN';
  }): Promise<string>;
}
