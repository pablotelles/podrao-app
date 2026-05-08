import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { Place } from '@/domain/entities/Place';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { ConflictError } from '@/application/errors/ConflictError';
import { ValidationError } from '@/application/errors/ValidationError';

export interface RejectPlaceDTO {
  placeId: string;
  reason: string;
  userId: string;
}

export class RejectPlace {
  constructor(private readonly placeRepo: IPlaceRepository) {}

  async execute(dto: RejectPlaceDTO): Promise<Place> {
    if (dto.reason.trim().length < 5 || dto.reason.trim().length > 255) {
      throw new ValidationError('O motivo de rejeição deve ter entre 5 e 255 caracteres');
    }

    const place = await this.placeRepo.findById(dto.placeId);
    if (!place) throw new PlaceNotFoundError(dto.placeId);

    if (place.status !== 'pending') {
      throw new ConflictError('Lugar já foi processado');
    }

    await this.placeRepo.updateStatus(dto.placeId, 'rejected', dto.reason.trim());

    // TODO: disparar email de rejeição ao criador do lugar

    const updated = await this.placeRepo.findById(dto.placeId);
    return updated!;
  }
}
