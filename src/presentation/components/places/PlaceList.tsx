import type { Place } from '@/domain/entities/Place';
import { PlaceCard } from './PlaceCard';
import { PlaceRow } from './PlaceRow';
import { PlaceCardSkeleton, EmptyState, Skeleton } from '@/presentation/components/ui';

interface PlaceListProps {
  places: Place[];
  isLoading: boolean;
  error?: Error | null;
  direction?: 'vertical' | 'horizontal';
  showRank?: boolean;
  onMenuClick?: (place: Place) => void;
}

function PlaceRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3">
      <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function PlaceList({
  places,
  isLoading,
  error,
  direction = 'vertical',
  showRank = false,
  onMenuClick,
}: PlaceListProps) {
  if (isLoading) {
    if (direction === 'horizontal') {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-48 shrink-0">
              <PlaceCardSkeleton />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <PlaceRowSkeleton key={i} />
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

  if (direction === 'horizontal') {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {places.map((place) => (
          <div key={place.id} className="w-48 shrink-0">
            <PlaceCard place={place} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {places.map((place, index) => (
        <PlaceRow
          key={place.id}
          place={place}
          rank={showRank ? index + 1 : undefined}
          onMenuClick={onMenuClick}
        />
      ))}
    </div>
  );
}
