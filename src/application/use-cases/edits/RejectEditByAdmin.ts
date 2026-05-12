import type { RejectEdit } from './RejectEdit';
import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';
import { EditNotFoundError } from '@/application/errors/EditNotFoundError';
import { EditNotPendingError } from '@/application/errors/EditNotPendingError';

export interface RejectEditByAdminDTO {
  editId: string;
  adminId: string;
}

export class RejectEditByAdmin {
  constructor(
    private readonly editRepo: IPlaceEditRepository,
    private readonly rejectEdit: RejectEdit,
  ) {}

  async execute(dto: RejectEditByAdminDTO): Promise<void> {
    const edit = await this.editRepo.findById(dto.editId);
    if (!edit) throw new EditNotFoundError(dto.editId);
    if (edit.status !== 'pending') throw new EditNotPendingError(edit.status);

    await this.rejectEdit.execute({
      editId: dto.editId,
      actorId: dto.adminId,
      mechanism: 'admin',
    });
  }
}
