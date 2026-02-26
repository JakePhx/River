import { ProfileEntity, UpdateProfileProps } from './profile.entity';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UserId } from '../value-object/user-id.vo';
import { Email } from '../value-object/email.vo';
import { Username } from '../value-object/username.vo';

export type UserRole = 'USER' | 'ADMIN';

export type CreateUserProps = {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role?: UserRole;
  isPrivate?: boolean;
  isActive?: boolean;
};

export type RehydrateUserProps = {
  id: UserId;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: Email;
  username: Username;
  passwordHash: string;
  role: UserRole;
  isPrivate: boolean;
  isActive: boolean;
  postCount: number;
  followersCount: number;
  followingCount: number;
  profile: ProfileEntity;
};

export type UpdateUserProps = {
  name?: string;
  password?: string;
  role?: UserRole;
  isPrivate?: boolean;
  isActive?: boolean;
  postCount?: number;
  followersCount?: number;
  followingCount?: number;
};

export class UserEntity {
  private constructor(
    public readonly id: UserId,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public name: string,
    public readonly email: Email,
    public readonly username: Username,
    public passwordHash: string,
    public role: UserRole,
    public isPrivate: boolean,
    public isActive: boolean,
    public postCount: number,
    public followersCount: number,
    public followingCount: number,
    public profile: ProfileEntity,
  ) {}

  static rehydrate(props: RehydrateUserProps): UserEntity {
    return new UserEntity(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.name,
      props.email,
      props.username,
      props.passwordHash,
      props.role,
      props.isPrivate,
      props.isActive,
      props.postCount,
      props.followersCount,
      props.followingCount,
      props.profile,
    );
  }

  static async create(props: CreateUserProps): Promise<UserEntity> {
    const now = new Date();
    return new UserEntity(
      UserId.create(),
      now,
      now,
      props.name,
      Email.create(props.email),
      Username.create(props.username),
      props.passwordHash,
      props.role ?? 'USER',
      props.isPrivate ?? false,
      props.isActive ?? true,
      0,
      0,
      0,
      ProfileEntity.empty(),
    );
  }

  async update(props: UpdateUserProps) {
    this.name = props.name ?? this.name;
    this.passwordHash = props.password
      ? await bcrypt.hash(props.password, 10)
      : this.passwordHash;
    this.role = props.role ?? this.role;
    this.isPrivate = props.isPrivate ?? this.isPrivate;
    this.isActive = props.isActive ?? this.isActive;
    this.postCount = props.postCount ?? this.postCount;
    this.followersCount = props.followersCount ?? this.followersCount;
    this.followingCount = props.followingCount ?? this.followingCount;
    this.updatedAt = new Date();
  }

  increasePostCount() {
    this.postCount++;
    this.updatedAt = new Date();
  }

  decreasePostCount() {
    this.postCount--;
    this.updatedAt = new Date();
  }

  increaseFollowersCount() {
    this.followersCount++;
    this.updatedAt = new Date();
  }

  decreaseFollowersCount() {
    this.followersCount--;
    this.updatedAt = new Date();
  }

  increaseFollowingCount() {
    this.followingCount++;
    this.updatedAt = new Date();
  }

  decreaseFollowingCount() {
    this.followingCount--;
    this.updatedAt = new Date();
  }

  changeName(name: string) {
    if (name.length < 3) throw new Error('NAME_TOO_SHORT');
    this.name = name;
    this.updatedAt = new Date();
  }

  upateProfile(profile: UpdateProfileProps) {
    this.profile.update(profile);
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.passwordHash);
  }
}
