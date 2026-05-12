export class EditRateLimitError extends Error {
  readonly code = 'EDIT_RATE_LIMIT';
  constructor(limit: number) {
    super(`Limite de ${limit} propostas por dia atingido. Tente novamente amanhã.`);
    this.name = 'EditRateLimitError';
  }
}
