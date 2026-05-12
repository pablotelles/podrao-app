import type { SupabaseClient } from '@supabase/supabase-js';
import type { EditVote } from '@/domain/entities/EditVote';
import type {
  IEditVoteRepository,
  CreateEditVoteData,
  EditVoteCounts,
} from '@/domain/interfaces/IEditVoteRepository';
import { createAdminClient } from './client';

interface EditVoteRow {
  id: string;
  edit_id: string;
  user_id: string;
  vote_type: string;
  created_at: string;
}

function rowToDomain(row: EditVoteRow): EditVote {
  return {
    id: row.id,
    editId: row.edit_id,
    userId: row.user_id,
    voteType: row.vote_type as 'confirm' | 'contest',
    createdAt: new Date(row.created_at),
  };
}

export class SupabaseEditVoteRepository implements IEditVoteRepository {
  constructor(private readonly db: SupabaseClient = createAdminClient()) {}

  async create(data: CreateEditVoteData): Promise<EditVote> {
    const { data: row, error } = await this.db
      .from('edit_vote')
      .insert({
        edit_id: data.editId,
        user_id: data.userId,
        vote_type: data.voteType,
      })
      .select()
      .single();

    if (error) throw new Error(`edit_vote insert: ${error.message}`);
    return rowToDomain(row as EditVoteRow);
  }

  async findByEditAndUser(editId: string, userId: string): Promise<EditVote | null> {
    const { data, error } = await this.db
      .from('edit_vote')
      .select('*')
      .eq('edit_id', editId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return rowToDomain(data as EditVoteRow);
  }

  async countVotes(editId: string): Promise<EditVoteCounts> {
    const { data, error } = await this.db
      .from('edit_vote')
      .select('vote_type')
      .eq('edit_id', editId);

    if (error) throw new Error(error.message);

    let confirmCount = 0;
    let contestCount = 0;
    for (const row of data ?? []) {
      if (row.vote_type === 'confirm') confirmCount++;
      else contestCount++;
    }

    return { confirmCount, contestCount };
  }
}
