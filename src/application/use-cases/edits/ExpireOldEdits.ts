import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';
import type { SendEditOutcomeEmail } from '../email/SendEditOutcomeEmail';
import {
  EDIT_EXPIRY_DAYS_LEVEL_1,
  EDIT_EXPIRY_DAYS_LEVEL_2,
} from '@/domain/value-objects/EditConstants';

export interface ExpireOldEditsResult {
  expiredCount: number;
}

export class ExpireOldEdits {
  constructor(
    private readonly editRepo: IPlaceEditRepository,
    private readonly sendEditOutcomeEmail: SendEditOutcomeEmail,
  ) {}

  async execute(): Promise<ExpireOldEditsResult> {
    const now = new Date();

    const level1Cutoff = new Date(now.getTime() - EDIT_EXPIRY_DAYS_LEVEL_1 * 24 * 60 * 60 * 1000);
    const level2Cutoff = new Date(now.getTime() - EDIT_EXPIRY_DAYS_LEVEL_2 * 24 * 60 * 60 * 1000);

    const expiredEdits = await this.editRepo.listPendingOlderThan({
      level1: level1Cutoff,
      level2: level2Cutoff,
    });

    for (const edit of expiredEdits) {
      await this.editRepo.updateStatus(edit.id, 'expired', 'system', now);
      // Fire-and-forget email
      void this.sendEditOutcomeEmail.execute({ editId: edit.id, event: 'expired' });
    }

    return { expiredCount: expiredEdits.length };
  }
}
