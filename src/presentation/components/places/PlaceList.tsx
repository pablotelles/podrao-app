import type { Place } from '@/domain/entities/Place';
import { PlaceCard } from './PlaceCard';
import { PlaceCardSkeleton } from '@/presentation/components/ui';

interface PlaceListProps {
  places: Place[];
  isLoading: boolean;
  error?: Error | null;
}

export function PlaceList({ places, isLoading, error }: PlaceListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-[var(--spacing-card-gap)] sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-error)]">
        Erro ao carregar lugares. Tente novamente.
      </p>
    );
  }

  if (!places.length) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
        Nenhum lugar encontrado nessa região. Que tal cadastrar o primeiro?
      </p>
    );
  }

  return (
    <div className="grid gap-[var(--spacing-card-gap)] sm:grid-cols-2">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
