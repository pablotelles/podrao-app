import type { IPlaceRepository } from '@/domain/interfaces/IPlaceRepository';
import type { IEmbeddingProvider } from '@/domain/interfaces/IEmbeddingProvider';
import type { CreatePlaceDTO } from '@/application/dtos/CreatePlaceDTO';
import { PlaceNotFoundError } from '@/application/errors/PlaceNotFoundError';

/** Constrói o texto descritivo enviado ao modelo de embedding.
 *  Formato: "{name} | {type} | {cuisines} | {meals} | {bairro} | {cidade} | {price}"
 *  Campos ausentes são omitidos. Ver docs/ai/prompts/place-embedding-text.md */
function buildEmbeddingText(dto: CreatePlaceDTO): string {
  return [
    dto.name,
    dto.establishmentType,
    dto.cuisineTypes.join(', '),
    dto.mealTypes.join(', '),
    dto.bairro,
    dto.cidade,
    dto.priceBucket,
  ]
    .filter(Boolean)
    .join(' | ');
}

export class GeneratePlaceEmbedding {
  constructor(
    private readonly placeRepo: IPlaceRepository,
    private readonly embedding: IEmbeddingProvider,
  ) {}

  async execute(placeId: string, dto: CreatePlaceDTO): Promise<void> {
    const place = await this.placeRepo.findById(placeId);
    if (!place) throw new PlaceNotFoundError(placeId);

    const text = buildEmbeddingText(dto);
    const vector = await this.embedding.embed(text);
    await this.placeRepo.saveEmbedding(placeId, vector);
  }
}
