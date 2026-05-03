import type { Place } from '@/domain/entities/Place';
import { PlaceCard } from './PlaceCard';
import { PlaceCardSkeleton, EmptyState } from '@/presentation/components/ui';

interface PlaceListProps {
  places: Place[];
  isLoading: boolean;
  error?: Error | null;
}

export function PlaceList({ places, isLoading, error }: PlaceListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-(--spacing-card-gap) sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Erro ao carregar lugares"
        description="Tente novamente em alguns instantes."
      />
    );
  }

  if (!places.length) {
    return (
      <EmptyState
        icon="🍽️"
        title="Nenhum lugar encontrado"
        description="Que tal cadastrar o primeiro lugar nessa região?"
      />
    );
  }

  return (
    <div className="grid gap-(--spacing-card-gap) sm:grid-cols-2">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}

