import { Star } from 'lucide-react';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')}k`;
  return String(n);
}

interface PlaceRatingProps {
  rating: number;
  reviewsCount: number;
  showCount?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function PlaceRating({
  rating,
  reviewsCount,
  showCount = true,
  showLabel = false,
  className,
}: PlaceRatingProps) {
  if (reviewsCount === 0) return null;

  return (
    <span className={`flex items-center gap-1 text-xs text-text-secondary ${className ?? ''}`}>
      <span className="font-bold text-md text-black">{rating.toFixed(1).replace('.', ',')}</span>
      <Star className="h-3 w-3 fill-warning text-warning" />
      {showCount && (
        <span className="text-text-disabled">
          ({formatCount(reviewsCount)}
          {showLabel && ' avaliações'})
        </span>
      )}
    </span>
  );
}
