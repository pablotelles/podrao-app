import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';
import type { ApplyApprovedEdit } from './ApplyApprovedEdit';
import { EditNotFoundError } from '@/application/errors/EditNotFoundError';
import { EditNotPendingError } from '@/application/errors/EditNotPendingError';

export interface ApproveEditByAdminDTO {
  editId: string;
  adminId: string;
}

export class ApproveEditByAdmin {
  constructor(
    private readonly editRepo: IPlaceEditRepository,
    private readonly applyApprovedEdit: ApplyApprovedEdit,
  ) {}

  async execute(dto: ApproveEditByAdminDTO): Promise<void> {
    const edit = await this.editRepo.findById(dto.editId);
    if (!edit) throw new EditNotFoundError(dto.editId);

    // Admin can approve pending or expired edits
    if (edit.status !== 'pending' && edit.status !== 'expired') {
      throw new EditNotPendingError(edit.status);
    }

    await this.applyApprovedEdit.execute({
      editId: dto.editId,
      actorId: dto.adminId,
      mechanism: 'admin',
    });
  }
}
