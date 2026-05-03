export interface User {
  id: string;
  email: string;
  nickname: string;
  name?: string;
  headline?: string;
  avatarUrl?: string;
  createdAt: Date;
}
