import type { SupabaseClient } from '@supabase/supabase-js';
import type { FieldHistory } from '@/domain/entities/FieldHistory';
import type { IFieldHistoryRepository } from '@/domain/interfaces/IFieldHistoryRepository';
import { createAdminClient } from './client';

interface FieldHistoryRow {
  id: string;
  place_id: string;
  field_name: string;
  old_value: unknown;
  new_value: unknown;
  changed_at: string;
  changed_by: string | null;
  mechanism: string;
  edit_id: string | null;
}

function rowToDomain(row: FieldHistoryRow): FieldHistory {
  return {
    id: row.id,
    placeId: row.place_id,
    fieldName: row.field_name,
    oldValue: row.old_value,
    newValue: row.new_value,
    changedAt: new Date(row.changed_at),
    changedBy: row.changed_by ?? undefined,
    mechanism: row.mechanism as 'community' | 'admin',
    editId: row.edit_id ?? undefined,
  };
}

export class SupabaseFieldHistoryRepository implements IFieldHistoryRepository {
  constructor(private readonly db: SupabaseClient = createAdminClient()) {}

  async findByPlace(placeId: string): Promise<FieldHistory[]> {
    const { data, error } = await this.db
      .from('field_history')
      .select('*')
      .eq('place_id', placeId)
      .order('changed_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToDomain(r as FieldHistoryRow));
  }

  async findByPlaceAndField(placeId: string, fieldName: string): Promise<FieldHistory[]> {
    const { data, error } = await this.db
      .from('field_history')
      .select('*')
      .eq('place_id', placeId)
      .eq('field_name', fieldName)
      .order('changed_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToDomain(r as FieldHistoryRow));
  }
}
