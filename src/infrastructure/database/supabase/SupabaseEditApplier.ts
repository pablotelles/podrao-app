import type { SupabaseClient } from '@supabase/supabase-js';
import type { IEditApplier, ApplyEditParams } from '@/domain/interfaces/IEditApplier';

export class SupabaseEditApplier implements IEditApplier {
  constructor(private readonly adminClient: SupabaseClient) {}

  async apply(params: ApplyEditParams): Promise<void> {
    const { error } = await this.adminClient.rpc('apply_approved_edit', {
      p_edit_id: params.editId,
      p_mechanism: params.mechanism,
      p_actor_id: params.actorId,
    });

    if (error) {
      throw new Error(`apply_approved_edit RPC failed: ${error.message}`);
    }
  }
}
