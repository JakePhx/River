export type UserBodyDTO = {
  id: string;
  name?: string;
  password?: string;
  isPrivate?: boolean;
  profile?: {
    id?: string;
    title?: string;
    company?: string;
    bio?: string;
    gender?: string;
    website?: string;
    birthDate?: Date;
    location?: string;
    avatarUrl?: string;
    contact?: string;
  };
};
