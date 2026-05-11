import type { OperatingPeriod } from '../value-objects/OperatingPeriod';
import type { PriceBucket } from '../value-objects/PriceBucket';

/** Parâmetros de busca geográfica com filtros opcionais */
export interface SearchPlacesParams {
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

/** Dados para criação de um novo lugar */
export interface CreatePlaceData {
  name: string;
  address: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  lat: number;
  lng: number;
  establishmentType: string;
  /** Operating periods when the place is active */
  periods: OperatingPeriod[];
  /** Adaptive key-value attributes by establishment type */
  attributes: Record<string, string[]>;
  priceBucket: PriceBucket;
  description?: string;
  photoUrl?: string;
  createdBy: string;
}
