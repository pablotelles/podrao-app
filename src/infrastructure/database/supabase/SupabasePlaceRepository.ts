import type { Place, PlaceStatus } from '@/domain/entities/Place';
import type { PendingPlaceItem } from '@/domain/entities/PendingPlaceItem';
import type { PlacePhoto, PhotoType } from '@/domain/entities/PlacePhoto';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { CreatePlaceData, SearchPlacesParams } from '@/domain/interfaces/shared';
import type { CuisineType } from '@/domain/value-objects/CuisineType';
import type { FoodType } from '@/domain/value-objects/FoodType';
import type { MealType } from '@/domain/value-objects/MealType';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';
import { calcPlaceScore } from './scoring';

// Shape returned by search_nearby_places RPC.
// cuisine_types, meal_types, food_types are TEXT[] reconstructed by subqueries in the SQL function.
interface PlaceRow {
  id: string;
  name: string;
  address: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string;
  lat: number;
  lng: number;
  establishment_type: string;
  cuisine_types: string[];
  meal_types: string[];
  food_types: string[];
  price_bucket: string;
  description: string | null;
  rejection_reason: string | null;
  median_price: number | null;
  logo_url: string | null;
  rating: number;
  reviews_count: number;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  distance_m?: number;
}

// Shape returned by .from('places').select(`*, place_stats(...), ...`) with joined relations.
interface PlaceRowWithRelations {
  id: string;
  name: string;
  address: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string;
  lat: number | string;
  lng: number | string;
  establishment_type: string;
  price_bucket: string;
  description: string | null;
  rejection_reason: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  place_stats:
    | { rating: number; reviews_count: number; median_price: number | null }[]
    | { rating: number; reviews_count: number; median_price: number | null }
    | null;
  place_cuisines: { cuisine_type: string }[] | null;
  place_meals: { meal_type: string }[] | null;
  place_food_types: { food_type: string }[] | null;
  place_photos: { url: string; type: string; position: number }[] | null;
}

interface PlacePhotoRow {
  id: string;
  place_id: string;
  url: string;
  type: string;
  position: number;
  uploaded_by: string | null;
  uploaded_at: string;
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStats(
  row: PlaceRowWithRelations,
): { rating: number; reviews_count: number; median_price: number | null } | null {
  return Array.isArray(row.place_stats) ? (row.place_stats[0] ?? null) : (row.place_stats ?? null);
}

function toDomain(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    numero: row.numero ?? undefined,
    complemento: row.complemento ?? undefined,
    bairro: row.bairro ?? undefined,
    cidade: row.cidade,
    estado: row.estado,
    lat: Number(row.lat),
    lng: Number(row.lng),
    establishmentType: row.establishment_type,
    cuisineTypes: (row.cuisine_types ?? []) as CuisineType[],
    mealTypes: (row.meal_types ?? []) as MealType[],
    foodTypes: (row.food_types ?? []) as FoodType[],
    priceBucket: row.price_bucket as PriceBucket,
    description: row.description ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    medianPrice: row.median_price ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    rating: Number(row.rating ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
    status: row.status as PlaceStatus,
    createdBy: row.created_by ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    distanceM: row.distance_m,
  };
}

export class SupabasePlaceRepository implements IPlaceRepository {
  constructor(private readonly db: SupabaseClient = supabase) {}

  // ─── reads ────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Place | null> {
    const { data, error } = await this.db
      .from('places')
      .select(
        `*,
         place_stats ( rating, reviews_count, median_price ),
         place_cuisines ( cuisine_type ),
         place_meals ( meal_type ),
         place_food_types ( food_type ),
         place_photos ( url, type, position )`,
      )
      .eq('id', id)
      .single();

    if (error || !data) return null;

    const row = data as PlaceRowWithRelations;

    // Supabase may return a 1:1 relation as an object or single-element array.
    const stats: { rating: number; reviews_count: number; median_price: number | null } | null =
      Array.isArray(row.place_stats) ? (row.place_stats[0] ?? null) : (row.place_stats ?? null);

    const cuisineTypes =
      (row.place_cuisines as { cuisine_type: string }[] | null)?.map(
        (c) => c.cuisine_type as CuisineType,
      ) ?? [];

    const mealTypes =
      (row.place_meals as { meal_type: string }[] | null)?.map((m) => m.meal_type as MealType) ??
      [];

    const foodTypes =
      (row.place_food_types as { food_type: string }[] | null)?.map(
        (f) => f.food_type as FoodType,
      ) ?? [];

    const logo = (
      row.place_photos as { url: string; type: string; position: number }[] | null
    )?.find((p) => p.type === 'logo');

    return {
      id: row.id,
      name: row.name,
      address: row.address,
      numero: row.numero ?? undefined,
      complemento: row.complemento ?? undefined,
      bairro: row.bairro ?? undefined,
      cidade: row.cidade,
      estado: row.estado,
      lat: Number(row.lat),
      lng: Number(row.lng),
      establishmentType: row.establishment_type,
      cuisineTypes,
      mealTypes,
      foodTypes,
      priceBucket: row.price_bucket as PriceBucket,
      description: row.description ?? undefined,
      rejectionReason: row.rejection_reason ?? undefined,
      medianPrice: stats?.median_price ?? undefined,
      logoUrl: logo?.url ?? undefined,
      rating: Number(stats?.rating ?? 0),
      reviewsCount: Number(stats?.reviews_count ?? 0),
      status: row.status as PlaceStatus,
      createdBy: row.created_by ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async searchNearby(params: SearchPlacesParams): Promise<Place[]> {
    const radius = params.radiusMeters ?? 3000;
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;

    const { data, error } = await this.db
      .from('places')
      .select(
        `*,
         place_stats ( rating, reviews_count, median_price ),
         place_cuisines ( cuisine_type ),
         place_meals ( meal_type ),
         place_food_types ( food_type ),
         place_photos ( url, type, position )`,
      )
      .eq('status', 'approved')
      .filter(
        'location',
        'st_dwithin',
        JSON.stringify({
          origin: `SRID=4326;POINT(${params.lng} ${params.lat})`,
          distance: radius,
          use_spheroid: false,
        }),
      );

    if (error) throw new Error(error.message);

    let rows = (data ?? []) as PlaceRowWithRelations[];

    if (params.mealType) {
      rows = rows.filter((r) => (r.place_meals ?? []).some((m) => m.meal_type === params.mealType));
    }

    if (params.cuisine) {
      rows = rows.filter((r) =>
        (r.place_cuisines ?? []).some((c) => c.cuisine_type === params.cuisine),
      );
    }

    if (params.foodType) {
      rows = rows.filter((r) =>
        (r.place_food_types ?? []).some((f) => f.food_type === params.foodType),
      );
    }

    // maxPrice is a monetary cap — no direct bucket mapping available, skipping price filter

    const withDistance = rows.map((row) => {
      const distanceM = haversineM(params.lat, params.lng, Number(row.lat), Number(row.lng));
      return { row, distanceM };
    });

    withDistance.sort(
      (a, b) =>
        calcPlaceScore({
          rating: Number(getStats(b.row)?.rating ?? 0),
          reviewsCount: Number(getStats(b.row)?.reviews_count ?? 0),
          distanceM: b.distanceM,
        }) -
        calcPlaceScore({
          rating: Number(getStats(a.row)?.rating ?? 0),
          reviewsCount: Number(getStats(a.row)?.reviews_count ?? 0),
          distanceM: a.distanceM,
        }),
    );

    return withDistance.slice(offset, offset + limit).map(({ row, distanceM }) => ({
      ...this.rowWithRelationsToDomain(row),
      distanceM,
    }));
  }

  async searchByName(query: string, limit = 20): Promise<Place[]> {
    const { data, error } = await this.db
      .from('places')
      .select(
        `*, place_stats(rating, reviews_count, median_price),
         place_cuisines(cuisine_type), place_meals(meal_type),
         place_food_types(food_type), place_photos(url, type, position)`,
      )
      .ilike('name', `%${query}%`)
      .eq('status', 'approved')
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => this.rowWithRelationsToDomain(row));
  }

  async countByCreator(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .eq('status', 'approved');

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  // ─── writes ───────────────────────────────────────────────────────────────

  async create(data: CreatePlaceData): Promise<Place> {
    const { data: row, error } = await this.db
      .from('places')
      .insert({
        name: data.name,
        address: data.address,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        lat: data.lat,
        lng: data.lng,
        location: `SRID=4326;POINT(${data.lng} ${data.lat})`,
        establishment_type: data.establishmentType,
        price_bucket: data.priceBucket,
        description: data.description ?? null,
        created_by: data.createdBy,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (data.cuisineTypes.length > 0) {
      const { error: e } = await this.db
        .from('place_cuisines')
        .insert(data.cuisineTypes.map((ct) => ({ place_id: row.id, cuisine_type: ct })));
      if (e) throw new Error(`place_cuisines insert: ${e.message}`);
    }

    if (data.mealTypes.length > 0) {
      const { error: e } = await this.db
        .from('place_meals')
        .insert(data.mealTypes.map((mt) => ({ place_id: row.id, meal_type: mt })));
      if (e) throw new Error(`place_meals insert: ${e.message}`);
    }

    if (data.foodTypes.length > 0) {
      const { error: e } = await this.db
        .from('place_food_types')
        .insert(data.foodTypes.map((ft) => ({ place_id: row.id, food_type: ft })));
      if (e) throw new Error(`place_food_types insert: ${e.message}`);
    }

    return toDomain({
      ...row,
      logo_url: null,
      cuisine_types: data.cuisineTypes,
      meal_types: data.mealTypes,
      food_types: data.foodTypes,
    } as PlaceRow);
  }

  async update(id: string, data: Partial<CreatePlaceData>): Promise<Place> {
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.address !== undefined) patch.address = data.address;
    if (data.numero !== undefined) patch.numero = data.numero;
    if (data.complemento !== undefined) patch.complemento = data.complemento;
    if (data.bairro !== undefined) patch.bairro = data.bairro;
    if (data.cidade !== undefined) patch.cidade = data.cidade;
    if (data.estado !== undefined) patch.estado = data.estado;
    if (data.lat !== undefined) patch.lat = data.lat;
    if (data.lng !== undefined) patch.lng = data.lng;
    if (data.establishmentType !== undefined) patch.establishment_type = data.establishmentType;
    if (data.priceBucket !== undefined) patch.price_bucket = data.priceBucket;

    const { data: row, error } = await this.db
      .from('places')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (data.cuisineTypes !== undefined) {
      await this.db.from('place_cuisines').delete().eq('place_id', id);
      if (data.cuisineTypes.length > 0) {
        const { error: e } = await this.db
          .from('place_cuisines')
          .insert(data.cuisineTypes.map((ct) => ({ place_id: id, cuisine_type: ct })));
        if (e) throw new Error(`place_cuisines update: ${e.message}`);
      }
    }

    if (data.mealTypes !== undefined) {
      await this.db.from('place_meals').delete().eq('place_id', id);
      if (data.mealTypes.length > 0) {
        const { error: e } = await this.db
          .from('place_meals')
          .insert(data.mealTypes.map((mt) => ({ place_id: id, meal_type: mt })));
        if (e) throw new Error(`place_meals update: ${e.message}`);
      }
    }

    if (data.foodTypes !== undefined) {
      await this.db.from('place_food_types').delete().eq('place_id', id);
      if (data.foodTypes.length > 0) {
        const { error: e } = await this.db
          .from('place_food_types')
          .insert(data.foodTypes.map((ft) => ({ place_id: id, food_type: ft })));
        if (e) throw new Error(`place_food_types update: ${e.message}`);
      }
    }

    return toDomain({
      ...row,
      logo_url: null,
      cuisine_types: data.cuisineTypes ?? [],
      meal_types: data.mealTypes ?? [],
      food_types: data.foodTypes ?? [],
    } as PlaceRow);
  }

  async updateStatus(id: string, status: PlaceStatus, rejectionReason?: string): Promise<void> {
    const patch: Record<string, unknown> = { status };
    if (status === 'rejected') {
      patch.rejection_reason = rejectionReason ?? null;
    } else {
      // Enforce DB constraint: rejection_reason must be NULL when not rejected
      patch.rejection_reason = null;
    }
    const { error } = await this.db.from('places').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
  }

  async saveEmbedding(id: string, embedding: number[]): Promise<void> {
    const { error } = await this.db.from('places').update({ embedding }).eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ─── photos ───────────────────────────────────────────────────────────────

  async getPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
    const { data, error } = await this.db
      .from('place_photos')
      .select('*')
      .eq('place_id', placeId)
      .order('type')
      .order('position');

    if (error) throw new Error(error.message);

    return (data ?? []).map((row: PlacePhotoRow) => ({
      id: row.id,
      placeId: row.place_id,
      url: row.url,
      type: row.type as PhotoType,
      position: row.position,
      uploadedBy: row.uploaded_by ?? undefined,
      uploadedAt: new Date(row.uploaded_at),
    }));
  }

  async addPlacePhoto(placeId: string, url: string, type: PhotoType): Promise<PlacePhoto> {
    const { data, error } = await this.db
      .from('place_photos')
      .insert({ place_id: placeId, url, type, position: 0 })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      placeId: data.place_id,
      url: data.url,
      type: data.type as PhotoType,
      position: data.position,
      uploadedBy: data.uploaded_by ?? undefined,
      uploadedAt: new Date(data.uploaded_at),
    };
  }

  async deletePlacePhoto(photoId: string): Promise<void> {
    const { error } = await this.db.from('place_photos').delete().eq('id', photoId);
    if (error) throw new Error(error.message);
  }

  // ─── helpers ──────────────────────────────────────────────────────────────

  private rowWithRelationsToDomain(row: PlaceRowWithRelations): Place {
    const stats: { rating: number; reviews_count: number; median_price: number | null } | null =
      Array.isArray(row.place_stats) ? (row.place_stats[0] ?? null) : (row.place_stats ?? null);
    const cuisineTypes =
      (row.place_cuisines as { cuisine_type: string }[] | null)?.map(
        (c) => c.cuisine_type as CuisineType,
      ) ?? [];
    const mealTypes =
      (row.place_meals as { meal_type: string }[] | null)?.map((m) => m.meal_type as MealType) ??
      [];
    const foodTypes =
      (row.place_food_types as { food_type: string }[] | null)?.map(
        (f) => f.food_type as FoodType,
      ) ?? [];
    const logo = (
      row.place_photos as { url: string; type: string; position: number }[] | null
    )?.find((p) => p.type === 'logo');
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      numero: row.numero ?? undefined,
      complemento: row.complemento ?? undefined,
      bairro: row.bairro ?? undefined,
      cidade: row.cidade,
      estado: row.estado,
      lat: Number(row.lat),
      lng: Number(row.lng),
      establishmentType: row.establishment_type,
      cuisineTypes,
      mealTypes,
      foodTypes,
      priceBucket: row.price_bucket as PriceBucket,
      medianPrice: stats?.median_price ?? undefined,
      rejectionReason: row.rejection_reason ?? undefined,
      logoUrl: logo?.url ?? undefined,
      rating: Number(stats?.rating ?? 0),
      reviewsCount: Number(stats?.reviews_count ?? 0),
      status: row.status as PlaceStatus,
      createdBy: row.created_by ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findByCreator(userId: string): Promise<Place[]> {
    const { data, error } = await this.db
      .from('places')
      .select(
        `*, place_stats(rating, reviews_count, median_price),
         place_cuisines(cuisine_type), place_meals(meal_type),
         place_food_types(food_type), place_photos(url, type, position)`,
      )
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => this.rowWithRelationsToDomain(row));
  }

  async getPendingPlaces(
    limit: number,
    offset: number,
  ): Promise<{ places: PendingPlaceItem[]; total: number }> {
    const [dataRes, countRes] = await Promise.all([
      this.db
        .from('places')
        .select(
          `*, place_stats(rating, reviews_count, median_price),
           place_cuisines(cuisine_type), place_meals(meal_type),
           place_food_types(food_type), place_photos(url, type, position)`,
        )
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      this.db.from('places').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    if (dataRes.error) throw new Error(dataRes.error.message);
    if (countRes.error) throw new Error(countRes.error.message);

    const rows = dataRes.data ?? [];
    const creatorIds = [...new Set(rows.map((r) => r.created_by).filter(Boolean))];
    let nicknameMap: Record<string, string> = {};
    if (creatorIds.length > 0) {
      const { data: profiles } = await this.db
        .from('profiles')
        .select('id, nickname')
        .in('id', creatorIds);
      nicknameMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.nickname]));
    }

    return {
      places: rows.map((row) => ({
        ...this.rowWithRelationsToDomain(row),
        creatorNickname: nicknameMap[row.created_by] ?? undefined,
      })),
      total: countRes.count ?? 0,
    };
  }

  async findFavoritedByUser(userId: string): Promise<Place[]> {
    const { data: favs, error: favErr } = await this.db
      .from('favorites')
      .select('place_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (favErr) throw new Error(favErr.message);
    if (!favs?.length) return [];

    const ids = favs.map((f: { place_id: string }) => f.place_id);
    const { data, error } = await this.db
      .from('places')
      .select(
        `*, place_stats(rating, reviews_count, median_price),
         place_cuisines(cuisine_type), place_meals(meal_type),
         place_food_types(food_type), place_photos(url, type, position)`,
      )
      .in('id', ids);

    if (error) throw new Error(error.message);
    // Preserve favorite ordering
    const map = new Map(((data ?? []) as PlaceRowWithRelations[]).map((r) => [r.id, r]));
    return ids
      .map((id) => map.get(id))
      .filter((r): r is PlaceRowWithRelations => r !== undefined)
      .map((r) => this.rowWithRelationsToDomain(r));
  }
}
