export class EditNotFoundError extends Error {
  readonly code = 'EDIT_NOT_FOUND';
  constructor(id: string) {
    super(`Proposta de edição não encontrada: ${id}`);
    this.name = 'EditNotFoundError';
  }
}
