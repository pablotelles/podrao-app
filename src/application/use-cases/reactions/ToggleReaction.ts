import type { IReactionRepository } from '@/domain/interfaces/IReactionRepository';

export interface ToggleReactionDTO {
  userId: string;
  entityType: string;
  entityId: string;
  type: string;
}

export class ToggleReaction {
  constructor(private readonly repo: IReactionRepository) {}

  async execute(
    dto: ToggleReactionDTO,
  ): Promise<{ active: boolean; counts: Record<string, number> }> {
    return this.repo.toggle(dto.userId, dto.entityType, dto.entityId, dto.type);
  }
}
