import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

export interface CreatePlaceDTO {
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
  /** ID do usuário autenticado criando o lugar */
  userId: string;
}
