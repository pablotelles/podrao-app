import type { UserList } from '@/domain/entities/List';
import type { IListRepository } from '@/domain/interfaces/IListRepository';
import type { UpdateListDTO } from '@/application/dtos/ListDTO';
import { UnauthorizedError } from '@/application/errors/UnauthorizedError';
import { ValidationError } from '@/application/errors/ValidationError';
import { buildSlug, generateUniqueSlug } from '@/domain/value-objects/Slug';

export class UpdateList {
  constructor(private readonly listRepo: IListRepository) {}

  async execute(dto: UpdateListDTO): Promise<UserList> {
    const isOwner = await this.listRepo.isOwner(dto.listId, dto.userId);
    if (!isOwner) {
      throw new UnauthorizedError('Você não tem permissão para atualizar esta lista');
    }

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (trimmedName.length === 0) {
        throw new ValidationError('Nome da lista não pode ser vazio');
      }
      dto.name = trimmedName;
    }

    // If becoming public and doesn't have a slug yet, generate one
    let slug: string | null | undefined;
    if (dto.isPublic === true) {
      const existing = await this.listRepo.findById(dto.listId);
      if (existing && !existing.slug) {
        const nameForSlug = dto.name ?? existing.name;
        const baseSlug = buildSlug(nameForSlug, '');
        slug = await generateUniqueSlug(baseSlug, (s) => this.listRepo.findBySlug(s));
      }
      // If it already has a slug, keep it (immutable)
    }
    // If becoming private, do NOT clear slug

    return this.listRepo.update(dto.listId, {
      name: dto.name,
      description: dto.description,
      isPublic: dto.isPublic,
      ...(slug !== undefined ? { slug } : {}),
    });
  }
}
