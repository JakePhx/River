import { UserEntity } from '../../domain/entity/user.entity';

export interface UserRepo {
  save(user: UserEntity): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  list(params: {
    query?: string;
    cursor?: string;
    take?: number;
  }): Promise<{ items: UserEntity[]; nextCursor: string | null }>;
  delete(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
}
