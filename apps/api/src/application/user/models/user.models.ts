// Application input models
export type UpdatePrivacyInput = {
  isPrivate: boolean;
};

export type UserRecord = {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  isPrivate: boolean;
  isActive: boolean;
  postCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
};
