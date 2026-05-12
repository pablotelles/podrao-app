import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';
import type { SendEditOutcomeEmail } from '../email/SendEditOutcomeEmail';
import { EditNotFoundError } from '@/application/errors/EditNotFoundError';
import { EditNotPendingError } from '@/application/errors/EditNotPendingError';

export type RejectMechanism = 'community' | 'admin' | 'system';

export interface RejectEditDTO {
  editId: string;
  actorId?: string;
  mechanism: RejectMechanism;
}

export class RejectEdit {
  constructor(
    private readonly editRepo: IPlaceEditRepository,
    private readonly sendEditOutcomeEmail: SendEditOutcomeEmail,
  ) {}

  async execute(dto: RejectEditDTO): Promise<void> {
    const edit = await this.editRepo.findById(dto.editId);
    if (!edit) throw new EditNotFoundError(dto.editId);
    if (edit.status !== 'pending') throw new EditNotPendingError(edit.status);

    await this.editRepo.updateStatus(dto.editId, 'rejected', dto.mechanism, new Date());

    // Fire-and-forget
    void this.sendEditOutcomeEmail.execute({ editId: dto.editId, event: 'rejected' });
  }
}
