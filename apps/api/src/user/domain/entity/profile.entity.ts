import { randomUUID } from 'crypto';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type CreateProfileProps = {
  title?: string;
  company?: string;
  bio?: string;
  gender?: Gender;
  website?: string;
  birthDate?: Date;
  location?: string;
  avatarUrl?: string;
  contact?: string;
};

export type RehydrateProfileProps = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  company?: string;
  bio?: string;
  gender?: Gender;
  website?: string;
  birthDate?: Date;
  location?: string;
  avatarUrl?: string;
  contact?: string;
};

export type UpdateProfileProps = {
  title?: string;
  company?: string;
  bio?: string;
  gender?: Gender;
  website?: string;
  birthDate?: Date;
  location?: string;
  avatarUrl?: string;
  contact?: string;
};

export class ProfileEntity {
  constructor(
    public id: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public title?: string,
    public company?: string,
    public bio?: string,
    public gender?: Gender,
    public website?: string,
    public birthDate?: Date,
    public location?: string,
    public contact?: string,
    public avatarUrl?: string,
  ) {}

  static empty(): ProfileEntity {
    const now = new Date();
    return new ProfileEntity(randomUUID(), now, now, '---', '---', '---');
  }

  static create(data: CreateProfileProps): ProfileEntity {
    const now = new Date();
    return new ProfileEntity(
      randomUUID(),
      now,
      now,
      data.title,
      data.company,
      data.bio,
      data.gender,
      data.website,
      data.birthDate,
      data.location,
      data.contact,
      data.avatarUrl,
    );
  }

  static rehydrate(data: RehydrateProfileProps): ProfileEntity {
    return new ProfileEntity(
      data.id,
      data.createdAt,
      data.updatedAt,
      data.title,
      data.company,
      data.bio,
      data.gender,
      data.website,
      data.birthDate,
      data.location,
      data.contact,
      data.avatarUrl,
    );
  }

  update(data: UpdateProfileProps) {
    this.title = data.title ?? this.title;
    this.company = data.company ?? this.company;
    this.bio = data.bio ?? this.bio;
    this.gender = data.gender ?? this.gender;
    this.website = data.website ?? this.website;
    this.birthDate = data.birthDate ?? this.birthDate;
    this.location = data.location ?? this.location;
    this.contact = data.contact ?? this.contact;
    this.avatarUrl = data.avatarUrl ?? this.avatarUrl;
    this.updatedAt = new Date();
  }
}
