import type { EditVote } from '@/domain/entities/EditVote';
import type { EditVoteType } from '@/domain/entities/EditVote';
import type { IPlaceEditRepository } from '@/domain/interfaces/IPlaceEditRepository';
import type { IEditVoteRepository } from '@/domain/interfaces/IEditVoteRepository';
import type { EvaluateEditThreshold } from './EvaluateEditThreshold';
import { EditNotFoundError } from '@/application/errors/EditNotFoundError';
import { EditNotPendingError } from '@/application/errors/EditNotPendingError';
import { EditSelfVoteError } from '@/application/errors/EditSelfVoteError';
import { EditDuplicateVoteError } from '@/application/errors/EditDuplicateVoteError';

export interface VoteOnEditDTO {
  editId: string;
  voteType: EditVoteType;
  userId: string;
}

export class VoteOnEdit {
  constructor(
    private readonly editRepo: IPlaceEditRepository,
    private readonly voteRepo: IEditVoteRepository,
    private readonly evaluateEditThreshold: EvaluateEditThreshold,
  ) {}

  async execute(dto: VoteOnEditDTO): Promise<EditVote> {
    // 1. Fetch and validate edit exists and is pending
    const edit = await this.editRepo.findById(dto.editId);
    if (!edit) throw new EditNotFoundError(dto.editId);
    if (edit.status !== 'pending') throw new EditNotPendingError(edit.status);

    // 2. Prevent self-vote
    if (edit.userId === dto.userId) throw new EditSelfVoteError();

    // 3. Prevent duplicate vote
    const existing = await this.voteRepo.findByEditAndUser(dto.editId, dto.userId);
    if (existing) throw new EditDuplicateVoteError();

    // 4. Record the vote
    const vote = await this.voteRepo.create({
      editId: dto.editId,
      userId: dto.userId,
      voteType: dto.voteType,
    });

    // 5. Evaluate threshold (synchronous — may approve or reject the edit)
    await this.evaluateEditThreshold.execute(dto.editId);

    return vote;
  }
}
