import type { IReactionRepository } from '@/domain/interfaces/IReactionRepository';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from './client';

export class SupabaseReactionRepository implements IReactionRepository {
  constructor(private readonly db: SupabaseClient = createAdminClient()) {}

  async toggle(
    userId: string,
    entityType: string,
    entityId: string,
    type: string,
  ): Promise<{ active: boolean; counts: Record<string, number> }> {
    const { count: existing } = await this.db
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('type', type);

    let active: boolean;

    if ((existing ?? 0) > 0) {
      await this.db
        .from('reactions')
        .delete()
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('type', type);
      active = false;
    } else {
      // Exclusividade mútua — remove outro tipo se existir
      await this.db
        .from('reactions')
        .delete()
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      await this.db.from('reactions').insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        type,
      });
      active = true;
    }

    // Lê contagens atualizadas da tabela denormalizada — O(1)
    const { data } = await this.db
      .from('reaction_counts')
      .select('type, count')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    const counts: Record<string, number> = {};
    for (const row of (data ?? []) as { type: string; count: number }[]) {
      counts[row.type] = row.count;
    }

    return { active, counts };
  }

  async getCountsBatch(
    entityType: string,
    entityIds: string[],
  ): Promise<Map<string, Record<string, number>>> {
    if (entityIds.length === 0) return new Map();

    // Lê da tabela denormalizada — sem COUNT(*), sem GROUP BY
    const { data } = await this.db
      .from('reaction_counts')
      .select('entity_id, type, count')
      .eq('entity_type', entityType)
      .in('entity_id', entityIds);

    const map = new Map<string, Record<string, number>>();
    for (const row of (data ?? []) as { entity_id: string; type: string; count: number }[]) {
      const counts = map.get(row.entity_id) ?? {};
      counts[row.type] = row.count;
      map.set(row.entity_id, counts);
    }
    return map;
  }

  async getUserActiveTypesBatch(
    userId: string,
    entityType: string,
    entityIds: string[],
  ): Promise<Map<string, string>> {
    if (entityIds.length === 0) return new Map();

    const { data } = await this.db
      .from('reactions')
      .select('entity_id, type')
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .in('entity_id', entityIds);

    return new Map(
      (data ?? []).map((r: { entity_id: string; type: string }) => [r.entity_id, r.type]),
    );
  }
}
