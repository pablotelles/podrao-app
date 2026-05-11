'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0 = não avaliado, 1-5
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  error?: string;
}

const ICON_SIZE = {
  sm: 16,
  md: 20,
  lg: 32,
};

export function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
  error,
}: StarRatingProps) {
  const px = ICON_SIZE[size];

  return (
    <div>
      <div
        className="flex gap-1"
        role={readonly ? 'img' : 'radiogroup'}
        aria-label="Avaliação por estrelas"
        aria-readonly={readonly}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role={readonly ? undefined : 'radio'}
            aria-checked={readonly ? undefined : value === star}
            onClick={() => !readonly && onChange(star)}
            disabled={readonly}
            className={[
              'transition-all',
              !readonly &&
                'cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:rounded',
              readonly && 'cursor-default',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
          >
            <Star
              width={px}
              height={px}
              className={star <= value ? 'fill-warning text-warning' : 'text-text-disabled'}
            />
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
