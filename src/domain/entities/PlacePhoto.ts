/**
 * PlacePhoto entity
 * Representa uma foto associada a um lugar (logo, cover, ou galeria).
 */

export type PhotoType = 'logo' | 'cover' | 'gallery';

export interface PlacePhoto {
  id: string;
  placeId: string;
  url: string;
  type: PhotoType;
  position: number;
  uploadedBy?: string;
  uploadedAt: Date;
}
