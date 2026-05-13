'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { useTopBarContext } from '@/presentation/contexts/TopBarContext';
import { useUser } from '@/presentation/contexts/UserContext';
import { Text } from '@/presentation/components/ui/Text';
import { PodraoLogo } from '@/presentation/components/ui/PodraoLogo';
import type { User } from '@/domain/entities/User';

const HIDDEN_ON = ['/login'];

function Avatar({ user }: { user: User | null }) {
  const router = useRouter();

  const initials = user
    ? (user.name ?? user.nickname ?? user.email)
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <button
      onClick={() => router.push('/profile')}
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-brand"
      aria-label="Ir para perfil"
    >
      {user?.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={initials}
          width={32}
          height={32}
          sizes="32px"
          className="h-full w-full object-cover"
          priority
        />
      ) : (
        <Text as="span" variant="caption" className="font-bold text-brand">
          {initials}
        </Text>
      )}
    </button>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { title, hideTopBar, trailingAction } = useTopBarContext();
  const { user } = useUser();

  if (hideTopBar || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <header
      className="fixed left-0 right-0 top-0 flex items-center justify-between bg-brand px-(--spacing-page-x) pt-safe"
      style={{ height: 'var(--topbar-height)', zIndex: 'var(--z-sticky)' }}
    >
      {/* Avatar */}
      <Avatar user={user} />

      {/* Título ou logo da marca */}
      {title ? (
        <Text
          variant="heading"
          textColor="inverse"
          as="h1"
          className="absolute left-1/2 -translate-x-1/2 max-w-[55%] truncate"
        >
          {title}
        </Text>
      ) : (
        <PodraoLogo variant="white" size={28} className="absolute left-1/2 -translate-x-1/2" />
      )}

      {/* Ações */}
      <div className="flex items-center gap-1">
        {trailingAction}
        <button
          onClick={() => router.push('/search')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-inverse transition-colors hover:bg-brand-hover"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-inverse transition-colors hover:bg-brand-hover"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
