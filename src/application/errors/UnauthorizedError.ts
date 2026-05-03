export class UnauthorizedError extends Error {
  readonly code = 'UNAUTHORIZED';
  constructor(message = 'Autenticação necessária') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
