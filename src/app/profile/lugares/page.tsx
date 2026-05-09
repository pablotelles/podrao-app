'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/presentation/contexts/UserContext';
import { useMyPlaces } from '@/presentation/hooks/useMyPlaces';
import { Badge, EmptyState, Skeleton } from '@/presentation/components/ui';
import { PlaceCard } from '@/presentation/components/places/PlaceCard';
import { PageHeader } from '@/presentation/components/ui/PageHeader';
import { STATUS_LABELS } from '@/presentation/lib/placeStatusLabels';

export default function LugaresPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { places, isLoading, error } = useMyPlaces();

  if (!loading && !user) {
    router.replace('/login');
    return null;
  }

  return (
    <main className="pb-16">
      <PageHeader title="Lugares que cadastrei" showBackButton onBack={() => router.back()} />
      <div className="px-(--spacing-page-x) py-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon="⚠️"
            title="Erro ao carregar lugares"
            description="Tente novamente em alguns instantes."
          />
        ) : places.length === 0 ? (
          <EmptyState icon="📍" title="Nenhum lugar cadastrado" />
        ) : (
          <div className="flex flex-col gap-2">
            {places.map((place) => {
              const statusInfo = STATUS_LABELS[place.status] ?? {
                label: place.status,
                variant: 'default' as const,
              };
              return (
                <PlaceCard
                  key={place.id}
                  place={place}
                  variant="expanded"
                  badge={<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
