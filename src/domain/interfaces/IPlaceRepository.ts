import type { Place, PlaceStatus } from '../entities/Place';
import type { CreatePlaceData } from './shared';
import type { SearchPlacesParams } from './shared';

export interface IPlaceReader {
  findById(id: string): Promise<Place | null>;
  searchNearby(params: SearchPlacesParams): Promise<Place[]>;
}

export interface IPlaceWriter {
  create(data: CreatePlaceData): Promise<Place>;
  updateStatus(id: string, status: PlaceStatus): Promise<void>;
  update(id: string, data: Partial<CreatePlaceData>): Promise<Place>;
  saveEmbedding(id: string, embedding: number[]): Promise<void>;
}

export interface IPlaceRepository extends IPlaceReader, IPlaceWriter {}
