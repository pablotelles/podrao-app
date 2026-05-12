export class EditConflictError extends Error {
  readonly code = 'EDIT_CONFLICT';
  constructor(fieldName: string) {
    super(`Já existe uma proposta de edição pendente para o campo "${fieldName}"`);
    this.name = 'EditConflictError';
  }
}
