import type { Favorite } from '@/domain/entities/Favorite';
import type { IFavoriteRepository } from '@/domain/interfaces/IFavoriteRepository';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';

interface FavoriteRow {
  user_id: string;
  place_id: string;
  created_at: string;
}

function toDomain(row: FavoriteRow): Favorite {
  return {
    userId: row.user_id,
    placeId: row.place_id,
    createdAt: new Date(row.created_at),
  };
}

export class SupabaseFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly db: SupabaseClient = supabase) {}

  async isFavorited(userId: string, placeId: string): Promise<boolean> {
    const { count, error } = await this.db
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    const { data, error } = await this.db
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as FavoriteRow[]).map(toDomain);
  }

  async add(userId: string, placeId: string): Promise<Favorite> {
    const { data: row, error } = await this.db
      .from('favorites')
      .insert({
        user_id: userId,
        place_id: placeId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toDomain(row as FavoriteRow);
  }

  async remove(userId: string, placeId: string): Promise<void> {
    const { error } = await this.db
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId);

    if (error) throw new Error(error.message);
  }

  async countByUser(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
