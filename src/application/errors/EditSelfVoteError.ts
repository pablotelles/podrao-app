export class EditSelfVoteError extends Error {
  readonly code = 'EDIT_SELF_VOTE';
  constructor() {
    super('Você não pode votar na própria proposta de edição');
    this.name = 'EditSelfVoteError';
  }
}
