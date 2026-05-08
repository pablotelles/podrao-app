import type { Place, PlaceStatus } from '../entities/Place';
import type { PendingPlaceItem } from '../entities/PendingPlaceItem';
import type { PlacePhoto, PhotoType } from '../entities/PlacePhoto';
import type { CreatePlaceData } from './shared';
import type { SearchPlacesParams } from './shared';

export interface IPlaceReader {
  findById(id: string): Promise<Place | null>;
  searchNearby(params: SearchPlacesParams): Promise<Place[]>;
  searchByName(query: string, limit?: number): Promise<Place[]>;
  countByCreator(userId: string): Promise<number>;
  findByCreator(userId: string): Promise<Place[]>;
  findFavoritedByUser(userId: string): Promise<Place[]>;
  getPendingPlaces(
    limit: number,
    offset: number,
  ): Promise<{ places: PendingPlaceItem[]; total: number }>;
}

export interface IPlaceWriter {
  create(data: CreatePlaceData): Promise<Place>;
  updateStatus(id: string, status: PlaceStatus, rejectionReason?: string): Promise<void>;
  update(id: string, data: Partial<CreatePlaceData>): Promise<Place>;
  saveEmbedding(id: string, embedding: number[]): Promise<void>;
}

export interface IPlacePhotoManager {
  getPlacePhotos(placeId: string): Promise<PlacePhoto[]>;
  addPlacePhoto(placeId: string, url: string, type: PhotoType): Promise<PlacePhoto>;
  deletePlacePhoto(photoId: string): Promise<void>;
}

export interface IPlaceRepository extends IPlaceReader, IPlaceWriter, IPlacePhotoManager {}
