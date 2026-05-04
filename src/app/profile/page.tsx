'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle, Pencil, MapPin, Star, Heart } from 'lucide-react';
import { FullScreenDrawer, Button, PageHeader } from '@/presentation/components/ui';
import {
  UserProfileHeader,
  EditProfileForm,
  EditableAvatar,
} from '@/presentation/components/profile';
import { UserListsSection } from '@/presentation/components/lists/UserListsSection';
import { UserFavoritesSection } from '@/presentation/components/favorites/UserFavoritesSection';
import { useUserStats } from '@/presentation/hooks/useUserStats';
import type { User } from '@/domain/entities/User';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const { stats } = useUserStats();

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

  function handleAvatarUpdate(newAvatarUrl: string) {
    setUser((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
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
      <PageHeader title="Minha Conta" showBackButton />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="overflow-auto">
          {/* Hero do perfil - Layout horizontal com componente reutilizável */}
          <div className="bg-bg px-(--spacing-page-x) pb-6 pt-6 border-b border-border">
            <UserProfileHeader
              avatarSrc={user?.avatarUrl}
              avatarFallback={initials}
              avatar={
                <EditableAvatar
                  src={user?.avatarUrl}
                  alt={user?.name || 'Avatar'}
                  fallback={initials}
                  size="md"
                  onUpdate={handleAvatarUpdate}
                />
              }
              name={user?.name || 'Sem nome'}
              nickname={user?.nickname || ''}
              headline={user?.headline}
              onEmptyHeadlineClick={() => setEditOpen(true)}
              stats={
                <div className="flex gap-6">
                  <ProfileStat
                    icon={<MapPin size={14} />}
                    value={String(stats?.placesCount ?? 0)}
                  />
                  <ProfileStat icon={<Star size={14} />} value={String(stats?.reviewsCount ?? 0)} />
                  <ProfileStat
                    icon={<Heart size={14} />}
                    value={String(stats?.favoritesCount ?? 0)}
                  />
                </div>
              }
              actions={
                <Button onClick={() => setEditOpen(true)} variant="ghost" size="icon">
                  <Pencil size={18} />
                </Button>
              }
            />
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

function ProfileStat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-text-secondary">{icon}</span>
      <span className="font-semibold text-text-primary">{value}</span>
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
