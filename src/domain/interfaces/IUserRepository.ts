import type { User } from '../entities/User';

export interface UpdateProfileData {
  nickname?: string;
  name?: string;
  headline?: string;
  avatarUrl?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateProfile(id: string, data: UpdateProfileData): Promise<User>;
  isNicknameTaken(nickname: string, excludeId?: string): Promise<boolean>;
}
