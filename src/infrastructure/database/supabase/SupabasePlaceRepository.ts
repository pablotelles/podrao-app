import type { Place, PlaceStatus } from '@/domain/entities/Place';
import type { PendingPlaceItem } from '@/domain/entities/PendingPlaceItem';
import type { PlacePhoto, PhotoType } from '@/domain/entities/PlacePhoto';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { CreatePlaceData, SearchPlacesParams } from '@/domain/interfaces/shared';
import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';
import { calcPlaceScore } from './scoring';

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
  place_periods: { period: string }[] | null;
  place_attributes: { key: string; value: string }[] | null;
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

/** Converts place_attributes rows into a grouped Record<key, string[]> */
function groupAttributes(rows: { key: string; value: string }[] | null): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const row of rows ?? []) {
    if (!result[row.key]) result[row.key] = [];
    result[row.key].push(row.value);
  }
  return result;
}

const PLACE_SELECT = `*,
  place_stats ( rating, reviews_count, median_price ),
  place_periods ( period ),
  place_attributes ( key, value ),
  place_photos ( url, type, position )`;

export class SupabasePlaceRepository implements IPlaceRepository {
  constructor(private readonly db: SupabaseClient = supabase) {}

  // ─── reads ────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Place | null> {
    const { data, error } = await this.db.from('places').select(PLACE_SELECT).eq('id', id).single();

    if (error || !data) return null;
    return this.rowWithRelationsToDomain(data as PlaceRowWithRelations);
  }

  async searchNearby(params: SearchPlacesParams): Promise<Place[]> {
    const radius = params.radiusMeters ?? 3000;
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;

    const { data, error } = await this.db
      .from('places')
      .select(PLACE_SELECT)
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

    if (params.period) {
      rows = rows.filter((r) => (r.place_periods ?? []).some((p) => p.period === params.period));
    }

    if (params.attributeKey && params.attributeValue) {
      rows = rows.filter((r) =>
        (r.place_attributes ?? []).some(
          (a) => a.key === params.attributeKey && a.value === params.attributeValue,
        ),
      );
    } else if (params.attributeKey) {
      rows = rows.filter((r) =>
        (r.place_attributes ?? []).some((a) => a.key === params.attributeKey),
      );
    }

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
      .select(PLACE_SELECT)
      .ilike('name', `%${query}%`)
      .eq('status', 'approved')
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => this.rowWithRelationsToDomain(row as PlaceRowWithRelations));
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

    if (data.periods.length > 0) {
      const { error: e } = await this.db
        .from('place_periods')
        .insert(data.periods.map((p) => ({ place_id: row.id, period: p })));
      if (e) throw new Error(`place_periods insert: ${e.message}`);
    }

    // Flatten attributes Record<key, string[]> into rows
    const attrRows: { place_id: string; key: string; value: string }[] = [];
    for (const [key, values] of Object.entries(data.attributes)) {
      for (const value of values) {
        attrRows.push({ place_id: row.id, key, value });
      }
    }
    if (attrRows.length > 0) {
      const { error: e } = await this.db.from('place_attributes').insert(attrRows);
      if (e) throw new Error(`place_attributes insert: ${e.message}`);
    }

    return this.rowWithRelationsToDomain({
      ...row,
      place_stats: null,
      place_periods: data.periods.map((p) => ({ period: p })),
      place_attributes: attrRows.map(({ key, value }) => ({ key, value })),
      place_photos: null,
    });
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

    if (data.periods !== undefined) {
      await this.db.from('place_periods').delete().eq('place_id', id);
      if (data.periods.length > 0) {
        const { error: e } = await this.db
          .from('place_periods')
          .insert(data.periods.map((p) => ({ place_id: id, period: p })));
        if (e) throw new Error(`place_periods update: ${e.message}`);
      }
    }

    if (data.attributes !== undefined) {
      await this.db.from('place_attributes').delete().eq('place_id', id);
      const attrRows: { place_id: string; key: string; value: string }[] = [];
      for (const [key, values] of Object.entries(data.attributes)) {
        for (const value of values) {
          attrRows.push({ place_id: id, key, value });
        }
      }
      if (attrRows.length > 0) {
        const { error: e } = await this.db.from('place_attributes').insert(attrRows);
        if (e) throw new Error(`place_attributes update: ${e.message}`);
      }
    }

    return this.rowWithRelationsToDomain({
      ...row,
      place_stats: null,
      place_periods: (data.periods ?? []).map((p) => ({ period: p })),
      place_attributes: data.attributes
        ? Object.entries(data.attributes).flatMap(([key, values]) =>
            values.map((value) => ({ key, value })),
          )
        : [],
      place_photos: null,
    });
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

    const periods =
      (row.place_periods as { period: string }[] | null)?.map((p) => p.period as OperatingPeriod) ??
      [];

    const attributes = groupAttributes(
      row.place_attributes as { key: string; value: string }[] | null,
    );

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
      periods,
      attributes,
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
      .select(PLACE_SELECT)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => this.rowWithRelationsToDomain(row as PlaceRowWithRelations));
  }

  async getPendingPlaces(
    limit: number,
    offset: number,
  ): Promise<{ places: PendingPlaceItem[]; total: number }> {
    const [dataRes, countRes] = await Promise.all([
      this.db
        .from('places')
        .select(PLACE_SELECT)
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
        ...this.rowWithRelationsToDomain(row as PlaceRowWithRelations),
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
    const { data, error } = await this.db.from('places').select(PLACE_SELECT).in('id', ids);

    if (error) throw new Error(error.message);
    // Preserve favorite ordering
    const map = new Map(((data ?? []) as PlaceRowWithRelations[]).map((r) => [r.id, r]));
    return ids
      .map((id) => map.get(id))
      .filter((r): r is PlaceRowWithRelations => r !== undefined)
      .map((r) => this.rowWithRelationsToDomain(r));
  }
}
