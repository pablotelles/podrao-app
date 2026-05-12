export type EditMechanism = 'community' | 'admin';

export interface FieldHistory {
  id: string;
  placeId: string;
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
  changedAt: Date;
  changedBy?: string;
  mechanism: EditMechanism;
  editId?: string;
}
