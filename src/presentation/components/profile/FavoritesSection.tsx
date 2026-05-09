'use client';

import { Heart } from 'lucide-react';
import { Button, EmptyState, Skeleton } from '@/presentation/components/ui';
import { PlaceList } from '@/presentation/components/places/PlaceList';
import { useFavoritePlaces } from '@/presentation/hooks/useFavoritePlaces';
import { SectionShell } from './SectionShell';

export function FavoritesSection() {
  const { places, isLoading, error } = useFavoritePlaces();

  return (
    <SectionShell
      title="Favoritos"
      footerLink={
        places.length > 0
          ? { label: 'Ver todos os favoritos', href: '/profile/favoritos' }
          : undefined
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-2 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="py-4 flex flex-col items-center gap-3">
          <p className="text-sm text-text-secondary">Não foi possível carregar favoritos</p>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : places.length === 0 ? (
        <EmptyState
          icon={<Heart size={32} />}
          title="Nenhum favorito ainda"
          description="Salve lugares que você quer visitar."
        />
      ) : (
        <div className="pb-4">
          <PlaceList places={places.slice(0, 5)} isLoading={false} />
        </div>
      )}
    </SectionShell>
  );
}
