'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, MapPin, Star, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/presentation/components/ui';

interface UserProfile {
  id: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: UserProfile | null) => {
        if (!data) router.replace('/login');
        else setUser(data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <main className="flex h-dvh flex-col bg-bg-subtle pb-16">
      {/* Header */}
      <header className="bg-bg border-b border-border px-(--spacing-page-x) py-4">
        <h1 className="text-lg font-bold text-text-primary">Minha Conta</h1>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-(--spacing-page-x) py-6">
          {/* Avatar + email */}
          <div className="flex items-center gap-4 rounded-xl bg-bg p-4 shadow-(--shadow-card) border border-border">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-text-inverse font-bold text-lg">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user?.email}</p>
              <p className="text-xs text-text-secondary mt-0.5">Membro</p>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) overflow-hidden">
            <ActionRow
              icon={<MapPin size={18} className="text-brand" />}
              label="Meus lugares"
              onClick={() => {}}
            />
            <div className="mx-4 h-px bg-border" />
            <ActionRow
              icon={<Star size={18} className="text-brand" />}
              label="Minhas avaliações"
              onClick={() => {}}
            />
          </div>

          {/* Logout */}
          <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) overflow-hidden">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-error transition-colors hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sair da conta</span>
            </button>
          </div>

          <p className="text-center text-xs text-text-disabled mt-2">Onde Comer · MVP</p>
        </div>
      )}
    </main>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-bg-subtle"
    >
      {icon}
      <span className="flex-1 text-left text-sm font-medium text-text-primary">{label}</span>
      <ChevronRight size={16} className="text-text-disabled" />
    </button>
  );
}
