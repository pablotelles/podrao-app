import type { User } from '@/domain/entities/User';
import type { IUserRepository, UpdateProfileData } from '@/domain/interfaces/IUserRepository';
import { supabase, createAdminClient } from './client';

interface ProfileRow {
  id: string;
  nickname: string;
  name: string | null;
  headline: string | null;
  avatar_url: string | null;
  created_at: string;
}

async function mergeWithAuth(profile: ProfileRow): Promise<User | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(profile.id);
  if (!data.user) return null;
  return {
    id: profile.id,
    email: data.user.email!,
    nickname: profile.nickname,
    name: profile.name ?? undefined,
    headline: profile.headline ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    createdAt: new Date(profile.created_at),
  };
}

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mergeWithAuth(data as ProfileRow);
  }

  async findByEmail(email: string): Promise<User | null> {
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.listUsers();
    const authUser = authData.users.find((u) => u.email === email);
    if (!authUser) return null;
    return this.findById(authUser.id);
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.nickname !== undefined) patch.nickname = data.nickname;
    if (data.name !== undefined)     patch.name = data.name || null;
    if (data.headline !== undefined) patch.headline = data.headline || null;
    if (data.avatarUrl !== undefined) patch.avatar_url = data.avatarUrl || null;

    const { data: row, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    const user = await mergeWithAuth(row as ProfileRow);
    if (!user) throw new Error('Perfil não encontrado após atualização');
    return user;
  }

  async isNicknameTaken(nickname: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('nickname', nickname);

    if (excludeId) query = query.neq('id', excludeId);

    const { count } = await query;
    return (count ?? 0) > 0;
  }
}
