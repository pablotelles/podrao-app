import type { PlaceVisit } from '@/domain/entities/PlaceVisit';
import type {
  IPlaceVisitRepository,
  CreateVisitData,
} from '@/domain/interfaces/IPlaceVisitRepository';
import type { VisitRecency } from '@/domain/value-objects/VisitRecency';
import type { SupabaseClient } from '@supabase/supabase-js';

interface PlaceVisitRow {
  id: string;
  place_id: string;
  user_id: string;
  recency: string;
  visited_at: string;
}

function toDomain(row: PlaceVisitRow): PlaceVisit {
  return {
    id: row.id,
    placeId: row.place_id,
    userId: row.user_id,
    recency: row.recency as VisitRecency,
    visitedAt: new Date(row.visited_at),
  };
}

export class SupabasePlaceVisitRepository implements IPlaceVisitRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(data: CreateVisitData): Promise<PlaceVisit> {
    const { data: row, error } = await this.db
      .from('place_visits')
      .insert({
        place_id: data.placeId,
        user_id: data.userId,
        recency: data.recency,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toDomain(row as PlaceVisitRow);
  }

  async countDistinctVisitorsForPlace(placeId: string): Promise<number> {
    // COUNT(DISTINCT user_id) via a group query is not directly supported in the JS client.
    // We fetch all user_ids and deduplicate in TypeScript — acceptable for MVP visit volumes.
    const { data, error } = await this.db
      .from('place_visits')
      .select('user_id')
      .eq('place_id', placeId);

    if (error) throw new Error(error.message);
    const unique = new Set((data ?? []).map((r: { user_id: string }) => r.user_id));
    return unique.size;
  }

  async hasUserVisited(placeId: string, userId: string): Promise<boolean> {
    const { count, error } = await this.db
      .from('place_visits')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async countByUserForPlace(placeId: string, userId: string): Promise<number> {
    const { count, error } = await this.db
      .from('place_visits')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', placeId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async getLastVisitForUser(placeId: string, userId: string): Promise<PlaceVisit | null> {
    const { data, error } = await this.db
      .from('place_visits')
      .select('*')
      .eq('place_id', placeId)
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return toDomain(data as PlaceVisitRow);
  }
}
