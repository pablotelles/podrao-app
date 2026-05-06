'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { useTopBarContext } from '@/presentation/contexts/TopBarContext';
import { useUser } from '@/presentation/contexts/UserContext';
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
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold text-brand"
      aria-label="Ir para perfil"
    >
      {user?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt={initials} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </button>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const { title } = useTopBarContext();
  const { user } = useUser();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <header
      className="fixed left-0 right-0 top-0 flex items-center justify-between bg-brand px-(--spacing-page-x) pt-safe"
      style={{ height: 'var(--topbar-height)', zIndex: 'var(--z-sticky)' }}
    >
      {/* Avatar */}
      <Avatar user={user} />

      {/* Título */}
      <h1 className="absolute left-1/2 -translate-x-1/2 max-w-[55%] truncate text-base font-bold text-text-inverse">
        {title}
      </h1>

      {/* Ações */}
      <div className="flex items-center gap-1">
        <button
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
