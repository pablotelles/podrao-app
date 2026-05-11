import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';

export interface SearchPlacesDTO {
  lat: number;
  lng: number;
  radiusMeters?: number;
  period?: OperatingPeriod;
  attributeKey?: string;
  attributeValue?: string;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}
