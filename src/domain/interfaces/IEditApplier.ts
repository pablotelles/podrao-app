import type { EditMechanism } from '@/domain/entities/FieldHistory';

export interface ApplyEditParams {
  editId: string;
  actorId: string | null;
  mechanism: EditMechanism;
}

export interface IEditApplier {
  apply(params: ApplyEditParams): Promise<void>;
}
