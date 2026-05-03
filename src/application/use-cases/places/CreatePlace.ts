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
    if (!dto.cuisineTypes.length)
      throw new ValidationError('Selecione ao menos um tipo de cozinha');
    if (!dto.mealTypes.length) throw new ValidationError('Selecione ao menos um tipo de refeição');

    const place = await this.placeRepo.create({
      name: dto.name.trim(),
      address: dto.address,
      bairro: dto.bairro,
      cidade: dto.cidade,
      estado: dto.estado,
      lat: dto.lat,
      lng: dto.lng,
      establishmentType: dto.establishmentType,
      cuisineTypes: dto.cuisineTypes,
      mealTypes: dto.mealTypes,
      priceBucket: dto.priceBucket,
      photoUrl: dto.photoUrl,
      createdBy: dto.createdBy,
    });

    // Invalida cache da região para o novo lugar aparecer nas buscas
    const lat = Math.round(dto.lat * 1000) / 1000;
    const lng = Math.round(dto.lng * 1000) / 1000;
    await this.cache.deletePattern(`places:${lat}:${lng}:*`);

    return place;
  }
}
