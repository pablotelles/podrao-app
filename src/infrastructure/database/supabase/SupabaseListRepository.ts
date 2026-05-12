import type { UserList, ListPlace, ListFavorite, ListSave } from '@/domain/entities/List';
import type {
  IListRepository,
  CreateListData,
  UpdateListData,
  FindRecentNearbyParams,
  FindRecentNearbyResult,
} from '@/domain/interfaces/IListRepository';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';

interface RecentListRpcRow {
  id: string;
  updated_at: string;
}

interface ListRow {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_url: string | null;
  slug: string | null;
  view_count: number;
  favorites_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
}

interface ListWithCountRow extends ListRow {
  list_places: { count: number }[];
}

interface ListPlaceRow {
  list_id: string;
  place_id: string;
  position: number;
  note: string | null;
  added_at: string;
}

function listToDomain(row: ListRow, placesCount?: number): UserList {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description ?? undefined,
    isPublic: row.is_public,
    coverUrl: row.cover_url ?? undefined,
    slug: row.slug ?? null,
    placesCount,
    viewCount: row.view_count ?? 0,
    favoritesCount: row.favorites_count ?? 0,
    savesCount: row.saves_count ?? 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function listPlaceToDomain(row: ListPlaceRow): ListPlace {
  return {
    listId: row.list_id,
    placeId: row.place_id,
    position: row.position,
    note: row.note ?? undefined,
    addedAt: new Date(row.added_at),
  };
}

export class SupabaseListRepository implements IListRepository {
  constructor(private readonly db: SupabaseClient = supabase) {}

  async findById(id: string): Promise<UserList | null> {
    const { data, error } = await this.db
      .from('lists')
      .select('*, list_places(count)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }

    const row = data as ListWithCountRow;
    const placesCount = row.list_places?.[0]?.count ?? 0;
    return listToDomain(row, placesCount);
  }

  async findBySlug(slug: string): Promise<UserList | null> {
    const { data, error } = await this.db
      .from('lists')
      .select('*, list_places(count)')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as ListWithCountRow;
    const placesCount = row.list_places?.[0]?.count ?? 0;
    return listToDomain(row, placesCount);
  }

  async searchPublicByText(q: string, limit = 20): Promise<UserList[]> {
    const { data, error } = await this.db
      .from('lists')
      .select('*, list_places(count)')
      .eq('is_public', true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(limit);

    if (error) throw new Error(error.message);

    return (data as ListWithCountRow[]).map((row) => {
      const placesCount = row.list_places?.[0]?.count ?? 0;
      return listToDomain(row, placesCount);
    });
  }

  async findByOwner(userId: string): Promise<UserList[]> {
    const { data, error } = await this.db
      .from('lists')
      .select('*, list_places(count)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data as ListWithCountRow[]).map((row) => {
      const placesCount = row.list_places?.[0]?.count ?? 0;
      return listToDomain(row, placesCount);
    });
  }

  async create(data: CreateListData): Promise<UserList> {
    const { data: row, error } = await this.db
      .from('lists')
      .insert({
        owner_id: data.ownerId,
        name: data.name,
        description: data.description,
        is_public: data.isPublic ?? true,
        cover_url: data.coverUrl,
        slug: data.slug ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return listToDomain(row as ListRow, 0);
  }

  async update(id: string, data: UpdateListData): Promise<UserList> {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
    if (data.coverUrl !== undefined) updateData.cover_url = data.coverUrl;
    if (data.slug !== undefined) updateData.slug = data.slug;

    const { error } = await this.db.from('lists').update(updateData).eq('id', id).select().single();

    if (error) throw new Error(error.message);

    // Re-fetch with count
    const list = await this.findById(id);
    if (!list) throw new Error('Lista não encontrada após atualização');
    return list;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from('lists').delete().eq('id', id);

    if (error) throw new Error(error.message);
  }

  async getPlaces(listId: string): Promise<ListPlace[]> {
    const { data, error } = await this.db
      .from('list_places')
      .select('*')
      .eq('list_id', listId)
      .order('position', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as ListPlaceRow[]).map(listPlaceToDomain);
  }

  async addPlace(listId: string, placeId: string, note?: string): Promise<ListPlace> {
    // Get next position
    const { data: existingPlaces } = await this.db
      .from('list_places')
      .select('position')
      .eq('list_id', listId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition =
      existingPlaces && existingPlaces.length > 0 ? existingPlaces[0].position + 1 : 0;

    const { data: row, error } = await this.db
      .from('list_places')
      .insert({
        list_id: listId,
        place_id: placeId,
        position: nextPosition,
        note,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return listPlaceToDomain(row as ListPlaceRow);
  }

  async reorderPlaces(listId: string, orderedPlaceIds: string[]): Promise<void> {
    await Promise.all(
      orderedPlaceIds.map((placeId, index) =>
        this.db
          .from('list_places')
          .update({ position: index })
          .eq('list_id', listId)
          .eq('place_id', placeId),
      ),
    );
  }

  async removePlace(listId: string, placeId: string): Promise<void> {
    const { error } = await this.db
      .from('list_places')
      .delete()
      .eq('list_id', listId)
      .eq('place_id', placeId);

    if (error) throw new Error(error.message);
  }

  async isOwner(listId: string, userId: string): Promise<boolean> {
    const { count, error } = await this.db
      .from('lists')
      .select('*', { count: 'exact', head: true })
      .eq('id', listId)
      .eq('owner_id', userId);

    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async incrementViewCount(listId: string): Promise<void> {
    await this.db.rpc('increment_list_view_count', { list_uuid: listId });
  }

  async toggleFavorite(userId: string, listId: string): Promise<{ favorited: boolean }> {
    const already = await this.isFavoritedByUser(userId, listId);

    if (already) {
      const { error } = await this.db
        .from('list_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('list_id', listId);
      if (error) throw new Error(error.message);
      return { favorited: false };
    } else {
      const { error } = await this.db
        .from('list_favorites')
        .insert({ user_id: userId, list_id: listId });
      if (error) throw new Error(error.message);
      return { favorited: true };
    }
  }

  async toggleSave(userId: string, listId: string): Promise<{ saved: boolean }> {
    const already = await this.isSavedByUser(userId, listId);

    if (already) {
      const { error } = await this.db
        .from('list_saves')
        .delete()
        .eq('user_id', userId)
        .eq('list_id', listId);
      if (error) throw new Error(error.message);
      return { saved: false };
    } else {
      const { error } = await this.db
        .from('list_saves')
        .insert({ user_id: userId, list_id: listId });
      if (error) throw new Error(error.message);
      return { saved: true };
    }
  }

  async isFavoritedByUser(userId: string, listId: string): Promise<boolean> {
    const { count, error } = await this.db
      .from('list_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('list_id', listId);
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async isSavedByUser(userId: string, listId: string): Promise<boolean> {
    const { count, error } = await this.db
      .from('list_saves')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('list_id', listId);
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async getFavoritesByUser(userId: string): Promise<ListFavorite[]> {
    const { data, error } = await this.db
      .from('list_favorites')
      .select('user_id, list_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      userId: r.user_id,
      listId: r.list_id,
      createdAt: new Date(r.created_at),
    }));
  }

  async getSavesByUser(userId: string): Promise<ListSave[]> {
    const { data, error } = await this.db
      .from('list_saves')
      .select('user_id, list_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      userId: r.user_id,
      listId: r.list_id,
      createdAt: new Date(r.created_at),
    }));
  }

  async findPublic(limit = 20, offset = 0): Promise<UserList[]> {
    const { data, error } = await this.db
      .from('lists')
      .select('*, list_places(count)')
      .eq('is_public', true)
      .order('favorites_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return (data as ListWithCountRow[]).map((row) => {
      const placesCount = row.list_places?.[0]?.count ?? 0;
      return listToDomain(row, placesCount);
    });
  }

  async findFeatured(limit = 10): Promise<UserList[]> {
    const { data, error } = await this.db
      .from('lists')
      .select('*, list_places(count)')
      .eq('is_public', true)
      .order('saves_count', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data as ListWithCountRow[]).map((row) => {
      const placesCount = row.list_places?.[0]?.count ?? 0;
      return listToDomain(row, placesCount);
    });
  }

  async findRecentNearby(params: FindRecentNearbyParams): Promise<FindRecentNearbyResult> {
    const { lat, lng, radiusM = 15000, since, cursor, limit = 10 } = params;

    const { data, error } = await this.db.rpc('search_recent_lists_nearby', {
      p_lat: lat ?? null,
      p_lng: lng ?? null,
      p_radius_m: radiusM,
      p_since: since ? since.toISOString() : null,
      p_cursor: cursor ? cursor.toISOString() : null,
      p_limit: limit,
    });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as RecentListRpcRow[];
    if (rows.length === 0) return { lists: [], nextCursor: null };

    const nextCursor = rows.length >= limit ? new Date(rows[rows.length - 1].updated_at) : null;

    const ids = rows.map((r) => r.id);

    const { data: listData, error: listErr } = await this.db
      .from('lists')
      .select('*, list_places(count)')
      .in('id', ids);

    if (listErr) throw new Error(listErr.message);

    const { data: placeData, error: placeErr } = await this.db
      .from('list_places')
      .select('list_id, position, places(bairro, place_stats(median_price))')
      .in('list_id', ids)
      .order('position', { ascending: true });

    if (placeErr) throw new Error(placeErr.message);

    type PlaceDataRow = {
      list_id: string;
      position: number;
      places: { bairro: string | null; place_stats: { median_price: number | null }[] } | null;
    };

    const placeRows = (placeData ?? []) as unknown as PlaceDataRow[];

    const bairroByList = new Map<string, string>();
    const pricesByList = new Map<string, number[]>();

    for (const pr of placeRows) {
      if (!pr.places) continue;
      const place = pr.places;

      if (place.bairro && !bairroByList.has(pr.list_id)) {
        bairroByList.set(pr.list_id, place.bairro);
      }

      const statsArr = Array.isArray(place.place_stats)
        ? place.place_stats
        : place.place_stats
          ? [place.place_stats]
          : [];
      const median = statsArr[0]?.median_price ?? null;
      if (median !== null) {
        const existing = pricesByList.get(pr.list_id) ?? [];
        existing.push(median);
        pricesByList.set(pr.list_id, existing);
      }
    }

    const listMap = new Map<string, UserList>(
      (listData as ListWithCountRow[]).map((row) => {
        const placesCount = row.list_places?.[0]?.count ?? 0;
        const prices = pricesByList.get(row.id) ?? [];
        const priceRangeMin = prices.length > 0 ? Math.min(...prices) : undefined;
        const priceRangeMax = prices.length > 0 ? Math.max(...prices) : undefined;
        const bairro = bairroByList.get(row.id);
        return [
          row.id,
          {
            ...listToDomain(row, placesCount),
            priceRangeMin,
            priceRangeMax,
            bairro,
          },
        ];
      }),
    );

    const lists = ids.map((id) => listMap.get(id)).filter((l): l is UserList => l !== undefined);

    return { lists, nextCursor };
  }

  async getSavedListsByUser(userId: string): Promise<UserList[]> {
    const { data: saves, error: savesErr } = await this.db
      .from('list_saves')
      .select('list_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (savesErr) throw new Error(savesErr.message);
    if (!saves?.length) return [];

    const ids = saves.map((s: { list_id: string }) => s.list_id);
    const { data, error } = await this.db
      .from('lists')
      .select('*, list_places(count)')
      .in('id', ids);

    if (error) throw new Error(error.message);
    const map = new Map(
      (data as ListWithCountRow[]).map((row) => [
        row.id,
        listToDomain(row, row.list_places?.[0]?.count ?? 0),
      ]),
    );
    return ids.map((id) => map.get(id)).filter(Boolean) as UserList[];
  }
}
