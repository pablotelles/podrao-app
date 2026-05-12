export class EditNotPendingError extends Error {
  readonly code = 'EDIT_NOT_PENDING';
  constructor(currentStatus: string) {
    super(`Esta proposta não está pendente (status atual: ${currentStatus})`);
    this.name = 'EditNotPendingError';
  }
}
