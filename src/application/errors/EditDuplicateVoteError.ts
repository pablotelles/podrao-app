export class EditDuplicateVoteError extends Error {
  readonly code = 'EDIT_DUPLICATE_VOTE';
  constructor() {
    super('Você já votou nesta proposta de edição');
    this.name = 'EditDuplicateVoteError';
  }
}
