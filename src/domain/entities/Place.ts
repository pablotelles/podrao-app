import type { OperatingPeriod } from '../value-objects/OperatingPeriod';
import type { PriceBucket } from '../value-objects/PriceBucket';

export type PlaceStatus = 'pending' | 'approved' | 'rejected';

export interface Place {
  id: string;
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
  /** Operating periods (when the place is open/relevant) */
  periods: OperatingPeriod[];
  /** Adaptive key-value attributes by establishment type.
   *  Keys: service_type, bar_focus, has_happy_hour, opens_early,
   *        food_tags, drink_tags, specialty_tags, payment_methods */
  attributes: Record<string, string[]>;
  priceBucket: PriceBucket;
  description?: string;
  rejectionReason?: string;
  /** URL do logo (extraída da relação place_photos where type='logo') */
  logoUrl?: string;
  rating: number;
  reviewsCount: number;
  status: PlaceStatus;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  /** Distância em metros — preenchida nas buscas geográficas */
  distanceM?: number;
}
