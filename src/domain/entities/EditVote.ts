export type EditVoteType = 'confirm' | 'contest';

export interface EditVote {
  id: string;
  editId: string;
  userId: string;
  voteType: EditVoteType;
  createdAt: Date;
}
