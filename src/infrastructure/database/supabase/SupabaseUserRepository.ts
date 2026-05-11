import type { User, UserRole } from '@/domain/entities/User';
import type { IUserRepository, UpdateProfileData } from '@/domain/interfaces/IUserRepository';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase, createAdminClient } from './client';

// Phase 4: email is now stored directly in profiles (migration 004),
// so findById no longer calls auth.admin.getUserById — one round-trip instead of two.
interface ProfileRow {
  id: string;
  email: string;
  nickname: string;
  name: string | null;
  headline: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

function toDomain(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    name: row.name ?? undefined,
    headline: row.headline ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    role: row.role,
    createdAt: new Date(row.created_at),
  };
}

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly db: SupabaseClient = supabase) {}

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('id, email, nickname, name, headline, avatar_url, role, created_at')
      .eq('id', id)
      .single();

    if (!error && data) return toDomain(data as ProfileRow);

    // Profile row doesn't exist yet (created lazily on first profile update).
    // Fall back to auth.users to get at least the email.
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.getUserById(id);
    if (!authData.user?.email) return null;

    return {
      id,
      email: authData.user.email,
      nickname: authData.user.email.split('@')[0],
      role: 'user',
      createdAt: new Date(authData.user.created_at),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('id, email, nickname, name, headline, avatar_url, role, created_at')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return toDomain(data as ProfileRow);
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    const admin = createAdminClient();

    const { data: existing } = await admin.from('profiles').select('id').eq('id', id).single();

    if (!existing) {
      const { data: authUser } = await admin.auth.admin.getUserById(id);
      if (!authUser.user) throw new Error('Usuario nao encontrado no auth');

      const meta = authUser.user.user_metadata as Record<string, string> | undefined;
      const defaultNickname =
        data.nickname ??
        meta?.name?.split(' ')[0]?.toLowerCase() ??
        authUser.user.email?.split('@')[0] ??
        id.slice(0, 8);

      const { data: newProfile, error: insertError } = await admin
        .from('profiles')
        .insert({
          id,
          email: authUser.user.email!,
          nickname: defaultNickname,
          name: data.name ?? meta?.full_name ?? null,
          headline: data.headline ?? null,
          avatar_url: data.avatarUrl ?? meta?.avatar_url ?? meta?.picture ?? null,
        })
        .select('id, email, nickname, name, headline, avatar_url, role, created_at')
        .single();

      if (insertError) throw new Error(`Erro ao criar perfil: ${insertError.message}`);
      return toDomain(newProfile as ProfileRow);
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.nickname !== undefined) patch.nickname = data.nickname;
    if (data.name !== undefined) patch.name = data.name || null;
    if (data.headline !== undefined) patch.headline = data.headline || null;
    if (data.avatarUrl !== undefined) patch.avatar_url = data.avatarUrl || null;

    const { data: row, error } = await admin
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select('id, email, nickname, name, headline, avatar_url, role, created_at')
      .single();

    if (error) throw new Error(error.message);
    return toDomain(row as ProfileRow);
  }

  async isNicknameTaken(nickname: string, excludeId?: string): Promise<boolean> {
    let query = this.db
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('nickname', nickname);

    if (excludeId) query = query.neq('id', excludeId);

    const { count } = await query;
    return (count ?? 0) > 0;
  }
}
