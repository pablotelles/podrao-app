import type { User } from '@/domain/entities/User';
import type { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { supabase } from './client';

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email!,
      createdAt: new Date(data.user.created_at),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return {
      id: (data as { id: string; email: string; created_at: string }).id,
      email: (data as { id: string; email: string; created_at: string }).email,
      createdAt: new Date((data as { id: string; email: string; created_at: string }).created_at),
    };
  }
}
