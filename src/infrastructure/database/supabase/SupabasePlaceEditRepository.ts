import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PlaceEdit,
  PlaceEditStatus,
  EditResolvedBy,
  PlaceEditWithVotes,
  PlaceEditWithPlace,
} from '@/domain/entities/PlaceEdit';
import type {
  IPlaceEditRepository,
  CreatePlaceEditData,
} from '@/domain/interfaces/IPlaceEditRepository';
import { createAdminClient } from './client';

interface PlaceEditRow {
  id: string;
  place_id: string;
  field_name: string;
  old_value: unknown;
  new_value: unknown;
  status: string;
  level: number;
  user_id: string;
  note: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

function rowToDomain(row: PlaceEditRow): PlaceEdit {
  return {
    id: row.id,
    placeId: row.place_id,
    fieldName: row.field_name,
    oldValue: row.old_value,
    newValue: row.new_value,
    status: row.status as PlaceEditStatus,
    level: row.level as 1 | 2,
    userId: row.user_id,
    note: row.note ?? undefined,
    createdAt: new Date(row.created_at),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
    resolvedBy: (row.resolved_by as EditResolvedBy) ?? undefined,
  };
}

async function buildWithVoteCounts(
  db: SupabaseClient,
  rows: PlaceEditRow[],
  viewerUserId?: string,
): Promise<PlaceEditWithVotes[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  // Single query fetches all votes — viewer's vote is filtered in-memory
  const { data: allVotes } = await db
    .from('edit_vote')
    .select('edit_id, user_id, vote_type')
    .in('edit_id', ids);

  const confirmMap: Record<string, number> = {};
  const contestMap: Record<string, number> = {};
  const viewerVoteMap: Record<string, 'confirm' | 'contest'> = {};

  for (const v of allVotes ?? []) {
    if (v.vote_type === 'confirm') {
      confirmMap[v.edit_id] = (confirmMap[v.edit_id] ?? 0) + 1;
    } else {
      contestMap[v.edit_id] = (contestMap[v.edit_id] ?? 0) + 1;
    }
    if (viewerUserId && v.user_id === viewerUserId) {
      viewerVoteMap[v.edit_id] = v.vote_type as 'confirm' | 'contest';
    }
  }

  return rows.map((row) => ({
    ...rowToDomain(row),
    confirmCount: confirmMap[row.id] ?? 0,
    contestCount: contestMap[row.id] ?? 0,
    viewerVote: viewerUserId ? (viewerVoteMap[row.id] ?? null) : undefined,
  }));
}

export class SupabasePlaceEditRepository implements IPlaceEditRepository {
  constructor(private readonly db: SupabaseClient = createAdminClient()) {}

  async create(data: CreatePlaceEditData): Promise<PlaceEdit> {
    const { data: row, error } = await this.db
      .from('place_edit')
      .insert({
        place_id: data.placeId,
        field_name: data.fieldName,
        old_value: data.oldValue,
        new_value: data.newValue,
        level: data.level,
        user_id: data.userId,
        note: data.note ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`place_edit insert: ${error.message}`);
    return rowToDomain(row as PlaceEditRow);
  }

  async findById(id: string): Promise<PlaceEdit | null> {
    const { data, error } = await this.db.from('place_edit').select('*').eq('id', id).maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return rowToDomain(data as PlaceEditRow);
  }

  async findPendingByPlaceAndField(placeId: string, fieldName: string): Promise<PlaceEdit | null> {
    const { data, error } = await this.db
      .from('place_edit')
      .select('*')
      .eq('place_id', placeId)
      .eq('field_name', fieldName)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return rowToDomain(data as PlaceEditRow);
  }

  async findWithVoteCounts(id: string, viewerUserId?: string): Promise<PlaceEditWithVotes | null> {
    const { data, error } = await this.db.from('place_edit').select('*').eq('id', id).maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const results = await buildWithVoteCounts(this.db, [data as PlaceEditRow], viewerUserId);
    return results[0] ?? null;
  }

  async listWithVoteCounts(placeId: string, viewerUserId?: string): Promise<PlaceEditWithVotes[]> {
    const { data, error } = await this.db
      .from('place_edit')
      .select('*')
      .eq('place_id', placeId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return buildWithVoteCounts(this.db, (data ?? []) as PlaceEditRow[], viewerUserId);
  }

  async listPendingByLevel(level: 1 | 2): Promise<PlaceEditWithVotes[]> {
    const { data, error } = await this.db
      .from('place_edit')
      .select('*')
      .eq('status', 'pending')
      .eq('level', level)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return buildWithVoteCounts(this.db, (data ?? []) as PlaceEditRow[]);
  }

  async listExpired(): Promise<PlaceEditWithVotes[]> {
    const { data, error } = await this.db
      .from('place_edit')
      .select('*')
      .eq('status', 'expired')
      .order('level', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return buildWithVoteCounts(this.db, (data ?? []) as PlaceEditRow[]);
  }

  async listPendingOlderThan(cutoff: { level1: Date; level2: Date }): Promise<PlaceEdit[]> {
    // Fetch level-1 and level-2 expired edits separately
    const [res1, res2] = await Promise.all([
      this.db
        .from('place_edit')
        .select('*')
        .eq('status', 'pending')
        .eq('level', 1)
        .lt('created_at', cutoff.level1.toISOString()),
      this.db
        .from('place_edit')
        .select('*')
        .eq('status', 'pending')
        .eq('level', 2)
        .lt('created_at', cutoff.level2.toISOString()),
    ]);

    if (res1.error) throw new Error(res1.error.message);
    if (res2.error) throw new Error(res2.error.message);

    return [...(res1.data ?? []), ...(res2.data ?? [])].map((r) => rowToDomain(r as PlaceEditRow));
  }

  async listByUserWithContext(userId: string): Promise<PlaceEditWithPlace[]> {
    const { data, error } = await this.db
      .from('place_edit')
      .select('*, place:places(name, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as (PlaceEditRow & {
      place: { name: string; slug: string | null } | null;
    })[];

    const withVotes = await buildWithVoteCounts(this.db, rows);

    return withVotes.map((edit, i) => ({
      ...edit,
      placeName: rows[i]?.place?.name ?? '',
      placeSlug: rows[i]?.place?.slug ?? null,
    }));
  }

  async countByUserSince(userId: string, since: Date): Promise<number> {
    const { count, error } = await this.db
      .from('place_edit')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since.toISOString());

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async updateStatus(
    id: string,
    status: PlaceEditStatus,
    resolvedBy: EditResolvedBy,
    resolvedAt: Date,
  ): Promise<void> {
    const { error } = await this.db
      .from('place_edit')
      .update({ status, resolved_by: resolvedBy, resolved_at: resolvedAt.toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
