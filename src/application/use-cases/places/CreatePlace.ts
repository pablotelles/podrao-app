import type { Place } from '@/domain/entities/Place';
import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { ICacheProvider } from '@/domain/interfaces/ICacheProvider';
import type { CreatePlaceDTO } from '@/application/dtos/CreatePlaceDTO';
import { ValidationError } from '@/application/errors/ValidationError';

export class CreatePlace {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly cache: ICacheProvider,
  ) {}

  async execute(dto: CreatePlaceDTO): Promise<Place> {
    if (!dto.name.trim()) throw new ValidationError('Nome do lugar é obrigatório');
    if (!dto.periods.length)
      throw new ValidationError('Selecione ao menos um período de funcionamento');

    const place = await this.placeRepo.create({
      name: dto.name.trim(),
      address: dto.address,
      numero: dto.numero,
      complemento: dto.complemento,
      bairro: dto.bairro,
      cidade: dto.cidade,
      estado: dto.estado,
      lat: dto.lat,
      lng: dto.lng,
      establishmentType: dto.establishmentType,
      periods: dto.periods,
      attributes: dto.attributes,
      priceBucket: dto.priceBucket,
      description: dto.description,
      photoUrl: dto.photoUrl,
      createdBy: dto.userId, // Use Case define created_by a partir do userId autenticado
    });

    // Invalida cache da região para o novo lugar aparecer nas buscas
    const lat = Math.round(dto.lat * 1000) / 1000;
    const lng = Math.round(dto.lng * 1000) / 1000;
    await this.cache.deletePattern(`places:${lat}:${lng}:*`);

    return place;
  }
}
