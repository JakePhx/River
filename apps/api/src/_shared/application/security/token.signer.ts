export const TOKEN_SIGNER = 'TOKEN_SIGNER';

export interface TokenSigner {
  signAccessToken(payload: {
    sub: string;
    username: string;
    role: 'USER' | 'ADMIN';
  }): Promise<string>;
}
