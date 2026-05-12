import type { IEditApplier } from '@/domain/interfaces/IEditApplier';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import type { SendEditOutcomeEmail } from '../email/SendEditOutcomeEmail';
import type { EditMechanism } from '@/domain/entities/FieldHistory';

export interface ApplyApprovedEditDTO {
  editId: string;
  actorId: string | null;
  mechanism: EditMechanism;
}

export class ApplyApprovedEdit {
  constructor(
    private readonly editApplier: IEditApplier,
    private readonly cacheProvider: ICacheProvider,
    private readonly sendEditOutcomeEmail: SendEditOutcomeEmail,
  ) {}

  async execute(dto: ApplyApprovedEditDTO): Promise<void> {
    await this.editApplier.apply({
      editId: dto.editId,
      actorId: dto.actorId,
      mechanism: dto.mechanism,
    });

    // Invalidate geo-cache for all entries — field changes affect place data returned by search
    await this.cacheProvider.deletePattern('places:*');

    // Fire-and-forget
    void this.sendEditOutcomeEmail.execute({ editId: dto.editId, event: 'approved' });
  }
}
