export const TOKENS = {
  // auth
  USER_AUTH_REPO: Symbol('USER_AUTH_REPO'),
  PASSWORD_HASHER: Symbol('PASSWORD_HASHER'),
  TOKEN_SIGNER: Symbol('TOKEN_SIGNER'),

  // user
  USER_REPO: Symbol('USER_REPO'),

  // profile
  PROFILE_REPO: Symbol('PROFILE_REPO'),
  USER_VISIBILITY: Symbol('USER_VISIBILITY'),

  // follow
  FOLLOW_REPO: Symbol('FOLLOW_REPO'),
  FOLLOW_REQUEST_REPO: Symbol('FOLLOW_REQUEST_REPO'),

  // block
  BLOCK_REPO: Symbol('BLOCK_REPO'),

  // post
  POST_REPO: Symbol('POST_REPO'),
  POST_USER: Symbol('POST_USER'),
} as const;
