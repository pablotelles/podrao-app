'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, PlusCircle, List, UserCircle } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Explorar', Icon: Compass },
  { href: '/add-place', label: 'Adicionar', Icon: PlusCircle, exact: true },
  { href: '/lists', label: 'Listas', Icon: List },
  { href: '/profile', label: 'Conta', Icon: UserCircle },
];

/** Páginas onde a nav não deve aparecer */
const HIDDEN_ON = ['/login', '/add-place'];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-border bg-bg safe-area-bottom">
      {TABS.map(({ href, label, Icon, exact }) => {
        const active = exact
          ? pathname === href
          : href === '/'
            ? pathname === '/'
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
              active ? 'text-brand' : 'text-text-secondary',
            ].join(' ')}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
