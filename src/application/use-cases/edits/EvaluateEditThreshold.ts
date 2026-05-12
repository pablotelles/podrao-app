import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';
import type { IEditVoteRepository } from '@/domain/interfaces/IEditVoteRepository';
import type { ApplyApprovedEdit } from './ApplyApprovedEdit';
import type { RejectEdit } from './RejectEdit';
import {
  EDIT_THRESHOLD_LEVEL_1,
  EDIT_THRESHOLD_LEVEL_2,
} from '@/domain/value-objects/EditConstants';

/**
 * Internal use case — called by VoteOnEdit after each vote.
 * Checks thresholds and triggers approval or rejection when conditions are met.
 * Idempotent: re-checks status=pending before acting.
 */
export class EvaluateEditThreshold {
  constructor(
    private readonly editRepo: IPlaceEditRepository,
    private readonly voteRepo: IEditVoteRepository,
    private readonly applyApprovedEdit: ApplyApprovedEdit,
    private readonly rejectEdit: RejectEdit,
  ) {}

  async execute(editId: string): Promise<void> {
    const edit = await this.editRepo.findById(editId);
    if (!edit || edit.status !== 'pending') return;

    const threshold = edit.level === 1 ? EDIT_THRESHOLD_LEVEL_1 : EDIT_THRESHOLD_LEVEL_2;
    const { confirmCount, contestCount } = await this.voteRepo.countVotes(editId);

    // Approval: confirm_count >= threshold AND confirm strictly outnumbers contest
    if (confirmCount >= threshold && confirmCount > contestCount) {
      await this.applyApprovedEdit.execute({
        editId,
        actorId: edit.userId,
        mechanism: 'community',
      });
      return;
    }

    // Early rejection per spec: "contest_count >= confirm_count e há pelo menos 1 voto de cada tipo"
    // This intentionally rejects on a tie (1:1, 2:2, etc.) — tie = no community consensus.
    if (contestCount >= confirmCount && confirmCount >= 1 && contestCount >= 1) {
      await this.rejectEdit.execute({
        editId,
        mechanism: 'community',
      });
    }
  }
}
