import { Star } from 'lucide-react';

interface PlaceRatingProps {
  rating: number;
  reviewsCount: number;
  showCount?: boolean;
  className?: string;
}

export function PlaceRating({
  rating,
  reviewsCount,
  showCount = true,
  className,
}: PlaceRatingProps) {
  if (reviewsCount === 0) return null;

  return (
    <span className={`flex items-center gap-1 text-xs text-text-secondary ${className ?? ''}`}>
      <Star className="h-3 w-3 fill-warning text-warning" />
      <span>{rating.toFixed(1)}</span>
      {showCount && <span className="text-text-disabled">({reviewsCount})</span>}
    </span>
  );
}
