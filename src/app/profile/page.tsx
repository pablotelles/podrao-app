'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Star, LogOut, Pencil, UserCircle } from 'lucide-react';
import { FullScreenDrawer } from '@/presentation/components/ui';
import { EditProfileForm } from '@/presentation/components/profile/EditProfileForm';
import { UserListsSection } from '@/presentation/components/lists/UserListsSection';
import { UserFavoritesSection } from '@/presentation/components/favorites/UserFavoritesSection';
import type { User } from '@/domain/entities/User';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: User | null) => {
        if (!data) {
          router.replace('/login');
          return;
        }
        setUser(data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user?.nickname?.slice(0, 2).toUpperCase() ?? '??');

  return (
    <main className="flex h-dvh flex-col bg-bg-subtle pb-16">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between bg-bg border-b border-border px-(--spacing-page-x) py-4">
        <h1 className="text-lg font-bold text-text-primary">Minha Conta</h1>
        {user && (
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-brand"
          >
            <Pencil size={15} />
            Editar perfil
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="overflow-auto">
          {/* Hero do perfil */}
          <div className="bg-bg px-(--spacing-page-x) pb-6 pt-8 flex flex-col items-center text-center border-b border-border">
            {/* Avatar */}
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand text-text-inverse text-3xl font-bold shadow-(--shadow-card) overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>

            {/* Nome e nickname */}
            <h2 className="text-xl font-bold text-text-primary leading-tight">
              {user?.name || 'Sem nome'}
            </h2>
            <p className="mt-0.5 text-sm text-text-secondary">@{user?.nickname}</p>

            {/* Headline */}
            {user?.headline ? (
              <p className="mt-3 text-sm text-text-secondary max-w-xs leading-relaxed">
                {user.headline}
              </p>
            ) : (
              <button
                onClick={() => setEditOpen(true)}
                className="mt-3 text-sm text-brand hover:underline"
              >
                + Adicionar uma bio
              </button>
            )}

            {/* Stats */}
            <div className="mt-5 flex gap-8">
              <StatPill icon={<MapPin size={14} />} value="0" label="lugares" />
              <StatPill icon={<Star size={14} />} value="0" label="avaliações" />
            </div>
          </div>

          {/* Seções */}
          <div className="flex flex-col gap-4 px-(--spacing-page-x) py-4">
            {/* Info */}
            <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) overflow-hidden">
              <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-text-disabled">
                Conta
              </p>
              <InfoRow
                icon={<UserCircle size={16} className="text-text-secondary" />}
                label="Email"
                value={user?.email ?? ''}
              />
            </div>

            {/* Listas */}
            <UserListsSection />

            {/* Favoritos */}
            <UserFavoritesSection />

            {/* Ações */}
            <div className="rounded-xl bg-bg border border-border shadow-(--shadow-card) overflow-hidden">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-error transition-colors hover:bg-red-50"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Sair da conta</span>
              </button>
            </div>

            <p className="text-center text-xs text-text-disabled pb-2">Onde Comer · MVP</p>
          </div>
        </div>
      )}

      {/* Drawer de edição */}
      <FullScreenDrawer open={editOpen} onClose={() => setEditOpen(false)} title="Editar perfil">
        {user && (
          <EditProfileForm
            user={user}
            onSaved={(updated) => {
              setUser(updated);
              setEditOpen(false);
            }}
            onCancel={() => setEditOpen(false)}
          />
        )}
      </FullScreenDrawer>
    </main>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-text-primary">{value}</span>
      <div className="flex items-center gap-1 text-xs text-text-secondary">
        {icon} {label}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}
