export interface IReactionRepository {
  // Toggle com exclusividade mútua — ativa um tipo ou remove se já estava ativo
  toggle(
    userId: string,
    entityType: string,
    entityId: string,
    type: string,
  ): Promise<{
    active: boolean;
    counts: Record<string, number>; // contagens atualizadas de todos os tipos
  }>;

  // Conta todas as reações por tipo para um lote de entidades
  // Map<entityId, { useful: 5, partial: 1, not_useful: 2 }>
  getCountsBatch(
    entityType: string,
    entityIds: string[],
  ): Promise<Map<string, Record<string, number>>>;

  // Qual tipo está ativo para o viewer por entidade (no máximo 1 por exclusividade)
  // Map<entityId, reactionType>
  getUserActiveTypesBatch(
    userId: string,
    entityType: string,
    entityIds: string[],
  ): Promise<Map<string, string>>;
}
