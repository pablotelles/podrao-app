import type { Place, PlaceStatus } from '@/domain/entities/Place';
import type { PlacePhoto, PhotoType } from '@/domain/entities/PlacePhoto';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { CreatePlaceData, SearchPlacesParams } from '@/domain/interfaces/shared';
import type { CuisineType } from '@/domain/value-objects/CuisineType';
import type { MealType } from '@/domain/value-objects/MealType';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';

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
  price_bucket: string;
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
    lat: row.lat,
    lng: row.lng,
    establishmentType: row.establishment_type,
    cuisineTypes: row.cuisine_types as CuisineType[],
    mealTypes: row.meal_types as MealType[],
    priceBucket: row.price_bucket as PriceBucket,
    medianPrice: row.median_price ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    status: row.status as PlaceStatus,
    createdBy: row.created_by ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    distanceM: row.distance_m,
  };
}

export class SupabasePlaceRepository implements IPlaceRepository {
  constructor(private readonly db: SupabaseClient = supabase) {}

  async findById(id: string): Promise<Place | null> {
    // Buscar o place
    const { data, error } = await this.db
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    // Buscar logo (se existir)
    const { data: logoData } = await this.db
      .from('place_photos')
      .select('url')
      .eq('place_id', id)
      .eq('type', 'logo')
      .limit(1)
      .maybeSingle();

    const row = data as any;
    row.logo_url = logoData?.url ?? null;
    
    return toDomain(row as PlaceRow);
  }

  async searchNearby(params: SearchPlacesParams): Promise<Place[]> {
    const { data, error } = await this.db.rpc('search_nearby_places', {
      p_lat: params.lat,
      p_lng: params.lng,
      p_radius_m: params.radiusMeters ?? 3000,
      p_meal_type: params.mealType ?? null,
      p_cuisine: params.cuisine ?? null,
      p_max_price: params.maxPrice ?? null,
      p_limit: params.limit ?? 20,
      p_offset: params.offset ?? 0,
    });

    if (error) throw new Error(error.message);
    return (data as PlaceRow[]).map(toDomain);
  }

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
        // PostGIS geography — construído via ST_MakePoint no trigger ou via SQL
        location: `SRID=4326;POINT(${data.lng} ${data.lat})`,
        establishment_type: data.establishmentType,
        cuisine_types: data.cuisineTypes,
        meal_types: data.mealTypes,
        price_bucket: data.priceBucket,
        created_by: data.createdBy,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toDomain(row as PlaceRow);
  }

  async update(id: string, data: Partial<CreatePlaceData>): Promise<Place> {
    const patch: Record<string, unknown> = {};
    if (data.name) patch.name = data.name;
    if (data.address) patch.address = data.address;
    if (data.bairro !== undefined) patch.bairro = data.bairro;
    if (data.cidade) patch.cidade = data.cidade;
    if (data.estado) patch.estado = data.estado;
    if (data.lat !== undefined) patch.lat = data.lat;
    if (data.lng !== undefined) patch.lng = data.lng;
    if (data.establishmentType) patch.establishment_type = data.establishmentType;
    if (data.cuisineTypes) patch.cuisine_types = data.cuisineTypes;
    if (data.mealTypes) patch.meal_types = data.mealTypes;
    if (data.priceBucket) patch.price_bucket = data.priceBucket;

    const { data: row, error } = await this.db
      .from('places')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toDomain(row as PlaceRow);
  }

  async updateStatus(id: string, status: PlaceStatus): Promise<void> {
    const { error } = await this.db.from('places').update({ status }).eq('id', id);

    if (error) throw new Error(error.message);
  }

  async saveEmbedding(id: string, embedding: number[]): Promise<void> {
    const { error } = await this.db.from('places').update({ embedding }).eq('id', id);

    if (error) throw new Error(error.message);
  }

  // ========== Photo Management ==========

  async getPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
    const { data, error } = await this.db
      .from('place_photos')
      .select('*')
      .eq('place_id', placeId)
      .order('type')
      .order('position');

    if (error) throw new Error(error.message);
    
    return (data || []).map((row: any) => ({
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
      .insert({
        place_id: placeId,
        url,
        type,
        position: 0,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const row = data as any;
    return {
      id: row.id,
      placeId: row.place_id,
      url: row.url,
      type: row.type as PhotoType,
      position: row.position,
      uploadedBy: row.uploaded_by ?? undefined,
      uploadedAt: new Date(row.uploaded_at),
    };
  }

  async deletePlacePhoto(photoId: string): Promise<void> {
    const { error } = await this.db.from('place_photos').delete().eq('id', photoId);

    if (error) throw new Error(error.message);
  }
}
