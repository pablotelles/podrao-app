import { Users } from 'lucide-react';

interface PlaceVisitorsCountProps {
  count: number;
}

export function PlaceVisitorsCount({ count }: PlaceVisitorsCountProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Users className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
      <span className="text-(--font-size-label) text-text-secondary">
        <strong className="font-semibold text-text-primary">{count}</strong>{' '}
        {count === 1 ? 'pessoa esteve aqui' : 'pessoas estiveram aqui'}
      </span>
    </div>
  );
}
