'use client';

import { useRouter } from 'next/navigation';
import { Button, EmptyState, Skeleton, Badge } from '@/presentation/components/ui';
import { PlaceCard } from '@/presentation/components/places/PlaceCard';
import { useMyPlaces } from '@/presentation/hooks/useMyPlaces';
import { SectionShell } from './SectionShell';
import { STATUS_LABELS } from '@/presentation/lib/placeStatusLabels';

export function RegisteredPlacesSection() {
  const router = useRouter();
  const { places, isLoading, error } = useMyPlaces();

  return (
    <SectionShell
      title="Lugares que cadastrei"
      footerLink={
        places.length > 0 ? { label: 'Ver todos os lugares', href: '/profile/lugares' } : undefined
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-2 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : error ? (
        <div className="py-4 flex flex-col items-center gap-3">
          <p className="text-sm text-text-secondary">Não foi possível carregar lugares</p>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : places.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Nenhum lugar cadastrado"
          action={
            <Button size="sm" onClick={() => router.push('/add-place')}>
              Cadastrar lugar
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2 pb-4">
          {places.slice(0, 5).map((place) => {
            const statusInfo = STATUS_LABELS[place.status] ?? {
              label: place.status,
              variant: 'default' as const,
            };
            return (
              <PlaceCard
                key={place.id}
                place={place}
                badge={<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
              />
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
