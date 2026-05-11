import { Star } from 'lucide-react';
import { Text } from './Text';

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
    <span className={`flex items-center gap-1 ${className ?? ''}`}>
      <Text as="span" variant="label" className="font-bold text-text-primary">
        {rating.toFixed(1).replace('.', ',')}
      </Text>
      <Star className="h-3 w-3 fill-warning text-warning" />
      {showCount && (
        <Text as="span" variant="caption" textColor="disabled">
          ({formatCount(reviewsCount)}
          {showLabel && ' avaliações'})
        </Text>
      )}
    </span>
  );
}
