import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import type { Place } from '@/domain/entities/Place';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';
import { ConflictError } from '@/application/errors/ConflictError';
import { ValidationError } from '@/application/errors/ValidationError';
import type { SendPlaceLifecycleEmail } from '@/application/use-cases/email/SendPlaceLifecycleEmail';

export interface RejectPlaceDTO {
  placeId: string;
  reason: string;
  userId: string;
}

export class RejectPlace {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly sendLifecycleEmail?: SendPlaceLifecycleEmail,
    private readonly cache?: ICacheProvider,
  ) {}

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

    if (this.cache && place.slug) {
      await this.cache.del(`place:slug:${place.slug}`);
    }

    // Envia email de rejeição — fail-soft, não bloqueia a operação
    if (this.sendLifecycleEmail) {
      void this.sendLifecycleEmail.execute({
        placeId: dto.placeId,
        event: 'rejected',
        rejectionReason: dto.reason.trim(),
      });
    }

    const updated = await this.placeRepo.findById(dto.placeId);
    return updated!;
  }
}
