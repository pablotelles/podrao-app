import type { EditVote, EditVoteType } from '../entities/EditVote';

export interface CreateEditVoteData {
  editId: string;
  userId: string;
  voteType: EditVoteType;
}

export interface EditVoteCounts {
  confirmCount: number;
  contestCount: number;
}

export interface IEditVoteRepository {
  create(data: CreateEditVoteData): Promise<EditVote>;
  findByEditAndUser(editId: string, userId: string): Promise<EditVote | null>;
  countVotes(editId: string): Promise<EditVoteCounts>;
}
