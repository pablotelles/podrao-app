import type { User } from '@/domain/entities/User';
import type { IUserRepository } from '@/domain/interfaces/IUserRepository';
import { ValidationError } from '@/application/errors/ValidationError';
import { ConflictError } from '@/application/errors/ConflictError';

export interface UpdateProfileDTO {
  userId: string;
  nickname?: string;
  name?: string;
  headline?: string;
  avatarUrl?: string;
}

const NICKNAME_REGEX = /^[a-z0-9_]{3,30}$/;

export class UpdateProfile {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: UpdateProfileDTO): Promise<User> {
    if (dto.nickname !== undefined) {
      if (!NICKNAME_REGEX.test(dto.nickname)) {
        throw new ValidationError(
          'Nickname deve ter 3–30 caracteres (letras minúsculas, números e _)',
        );
      }
      const taken = await this.userRepo.isNicknameTaken(dto.nickname, dto.userId);
      if (taken) throw new ConflictError('Este nickname já está em uso');
    }

    if (dto.name !== undefined && dto.name.length > 80) {
      throw new ValidationError('Nome deve ter no máximo 80 caracteres');
    }

    if (dto.headline !== undefined && dto.headline.length > 160) {
      throw new ValidationError('Headline deve ter no máximo 160 caracteres');
    }

    return this.userRepo.updateProfile(dto.userId, {
      nickname: dto.nickname,
      name: dto.name,
      headline: dto.headline,
      avatarUrl: dto.avatarUrl,
    });
  }
}
