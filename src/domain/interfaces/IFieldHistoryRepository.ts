import type { FieldHistory } from '../entities/FieldHistory';

export interface IFieldHistoryRepository {
  findByPlace(placeId: string): Promise<FieldHistory[]>;
  findByPlaceAndField(placeId: string, fieldName: string): Promise<FieldHistory[]>;
}
