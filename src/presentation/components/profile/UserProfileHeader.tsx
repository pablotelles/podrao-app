import type { ReactNode } from 'react';
import { UserAvatar } from './UserAvatar';
import { UserName } from './UserName';
import { UserNickname } from './UserNickname';
import { UserLocation } from './UserLocation';
import { UserHeadline } from './UserHeadline';

interface UserProfileHeaderProps {
  avatarSrc?: string;
  avatarFallback: string;
  name: string;
  nickname: string;
  location?: string;
  headline?: string;
  stats?: ReactNode; // Stats estilo Instagram (lugares, avaliações, favoritos)
  actions?: ReactNode; // Slot para botões como "Editar perfil"
  avatar?: ReactNode; // Slot customizável para avatar (ex: EditableAvatar)
  onEmptyHeadlineClick?: () => void;
}

export function UserProfileHeader({
  avatarSrc,
  avatarFallback,
  name,
  nickname,
  location,
  headline,
  stats,
  actions,
  avatar,
  onEmptyHeadlineClick,
}: UserProfileHeaderProps) {
  return (
    <div>
      <div className="flex gap-4 items-start">
        {/* Avatar à esquerda - usa slot customizado se fornecido */}
        {avatar || <UserAvatar src={avatarSrc} alt={name} fallback={avatarFallback} size="md" />}

        {/* Info à direita */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 ">
            <div className="flex-1 min-w-0">
              {/* Nome */}
              <UserName name={name} size="sm" />

              {/* Nickname */}

              <UserNickname nickname={nickname} size="sm" />
            </div>

            {/* Slot para ações (ex: botão Editar perfil) */}
            {actions && <div className="shrink-0">{actions}</div>}
          </div>

          {/* Stats estilo Instagram */}
          {stats && <div className="mb-3">{stats}</div>}

          {/* Localização (opcional) */}
          {location && (
            <div className="mb-2">
              <UserLocation location={location} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Headline/Bio - Começa alinhado com o avatar (esquerda) */}
      {headline ? (
        <div className="mt-3">
          <UserHeadline headline={headline} size="sm" />
        </div>
      ) : onEmptyHeadlineClick ? (
        <button onClick={onEmptyHeadlineClick} className="mt-3 text-sm text-brand hover:underline">
          + Adicionar uma bio
        </button>
      ) : null}
    </div>
  );
}
