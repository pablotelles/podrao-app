import type { Place } from '@/domain/entities/Place';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { SearchPlacesDTO } from '@/application/dtos/SearchPlacesDTO';

function buildGeoKey(dto: SearchPlacesDTO): string {
  const lat = Math.round(dto.lat * 1000) / 1000;
  const lng = Math.round(dto.lng * 1000) / 1000;
  return [
    'places',
    lat,
    lng,
    dto.radiusMeters ?? 3000,
    dto.period ?? 'all',
    dto.establishmentType ?? 'all',
    dto.attributeKey ? `${dto.attributeKey}:${dto.attributeValue ?? ''}` : 'all',
    dto.maxPrice ?? 'all',
  ].join(':');
}

function getTtl(): number {
  const hour = new Date().getHours();
  if (hour >= 11 && hour < 14) return 60; // rush do almoço
  if (hour >= 19 && hour < 23) return 600; // noite
  return 300;
}

export class SearchNearbyPlaces {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly cache: ICacheProvider,
  ) {}

  async execute(dto: SearchPlacesDTO): Promise<Place[]> {
    const key = buildGeoKey(dto);

    const cached = await this.cache.get<Place[]>(key);
    if (cached) return cached;

    const places = await this.placeRepo.searchNearby({
      lat: dto.lat,
      lng: dto.lng,
      radiusMeters: dto.radiusMeters,
      period: dto.period,
      establishmentType: dto.establishmentType,
      attributeKey: dto.attributeKey,
      attributeValue: dto.attributeValue,
      maxPrice: dto.maxPrice,
      limit: dto.limit,
      offset: dto.offset,
    });

    await this.cache.set(key, places, { ttl: getTtl() });
    return places;
  }
}
