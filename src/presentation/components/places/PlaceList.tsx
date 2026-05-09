import type { Place } from '@/domain/entities/Place';
import { PlaceCard } from './PlaceCard';
import { EmptyState, Skeleton } from '@/presentation/components/ui';

interface PlaceListProps {
  places: Place[];
  isLoading: boolean;
  error?: Error | null;
  variant?: 'brief' | 'expanded';
  /** 'divided': linhas com border-b (padrão, para uso dentro de SectionShell)
   *  'cards': cada item com shadow individual (para uso standalone) */
  display?: 'divided' | 'cards';
  showRank?: boolean;
  onMenuClick?: (place: Place) => void;
}

function PlaceCardSkeleton({
  variant,
  standalone,
}: {
  variant: 'brief' | 'expanded';
  standalone: boolean;
}) {
  const align = variant === 'expanded' ? 'items-start' : 'items-center';
  const cls = standalone
    ? `flex ${align} gap-3 rounded-md bg-bg ${variant === 'expanded' ? 'p-3.5' : 'p-3'} shadow-(--shadow-card)`
    : `flex ${align} gap-3 border-b border-bg-subtle py-3 last:border-b-0`;
  const thumbCls = variant === 'expanded' ? 'h-18 w-18' : 'h-14 w-14';

  return (
    <div className={cls}>
      <Skeleton className={`${thumbCls} shrink-0 rounded-md`} />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        {variant === 'expanded' && <Skeleton className="h-3 w-full" />}
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function PlaceList({
  places,
  isLoading,
  error,
  variant = 'brief',
  display = 'divided',
  showRank = false,
  onMenuClick,
}: PlaceListProps) {
  const standalone = display === 'cards';
  const containerCls = standalone ? 'flex flex-col gap-2' : 'flex flex-col';

  if (isLoading) {
    return (
      <div className={containerCls}>
        {Array.from({ length: 4 }).map((_, i) => (
          <PlaceCardSkeleton key={i} variant={variant} standalone={standalone} />
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
    <div className={containerCls}>
      {places.map((place, index) => (
        <PlaceCard
          key={place.id}
          place={place}
          variant={variant}
          rank={showRank ? index + 1 : undefined}
          onMenuClick={onMenuClick}
          standalone={standalone}
        />
      ))}
    </div>
  );
}
