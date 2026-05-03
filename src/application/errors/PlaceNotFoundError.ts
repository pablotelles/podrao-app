export class PlaceNotFoundError extends Error {
  readonly code = 'PLACE_NOT_FOUND';
  constructor(id: string) {
    super(`Lugar não encontrado: ${id}`);
    this.name = 'PlaceNotFoundError';
  }
}
