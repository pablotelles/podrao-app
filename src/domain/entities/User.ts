export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  nickname: string;
  name?: string;
  headline?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
}
