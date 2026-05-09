'use client';

import { useState } from 'react';
import { MapPin, Star, Heart, Pencil } from 'lucide-react';
import { FullScreenDrawer, Button } from '@/presentation/components/ui';
import { useUser } from '@/presentation/contexts/UserContext';
import { useUserStats } from '@/presentation/hooks/useUserStats';
import { UserProfileHeader } from './UserProfileHeader';
import { EditableAvatar } from './EditableAvatar';
import { EditProfileForm } from './EditProfileForm';

function ProfileStat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-text-secondary">{icon}</span>
      <span className="font-semibold text-text-primary">{value}</span>
    </div>
  );
}

export function IdentitySection() {
  const { user, updateUser } = useUser();
  const { stats } = useUserStats();
  const [editOpen, setEditOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user?.nickname?.slice(0, 2).toUpperCase() ?? '??');

  function handleAvatarUpdate(newAvatarUrl: string) {
    updateUser({ avatarUrl: newAvatarUrl });
  }

  return (
    <>
      <div className="bg-bg px-(--spacing-page-x) pb-6 pt-6 border-b border-border mb-2">
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
              <ProfileStat icon={<MapPin size={14} />} value={String(stats?.placesCount ?? 0)} />
              <ProfileStat icon={<Star size={14} />} value={String(stats?.reviewsCount ?? 0)} />
              <ProfileStat icon={<Heart size={14} />} value={String(stats?.favoritesCount ?? 0)} />
            </div>
          }
          actions={
            <Button onClick={() => setEditOpen(true)} variant="ghost" size="icon">
              <Pencil size={18} />
            </Button>
          }
        />
      </div>

      <FullScreenDrawer open={editOpen} onClose={() => setEditOpen(false)} title="Editar perfil">
        {user && (
          <EditProfileForm
            user={user}
            onSaved={(updated) => {
              updateUser(updated);
              setEditOpen(false);
            }}
            onCancel={() => setEditOpen(false)}
          />
        )}
      </FullScreenDrawer>
    </>
  );
}
