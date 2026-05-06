'use client';

interface StarRatingProps {
  value: number; // 0 = não avaliado, 1-5
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  error?: string;
}

const SIZE_CLASSES = {
  sm: 'text-base', // 16px
  md: 'text-xl', // 20px
  lg: 'text-3xl', // 30px
};

/**
 * Star rating component (1-5 stars).
 * Used for review ratings and category scores.
 */
export function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
  error,
}: StarRatingProps) {
  const handleClick = (rating: number) => {
    if (!readonly) {
      onChange(rating);
    }
  };

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
            onClick={() => handleClick(star)}
            disabled={readonly}
            className={[
              SIZE_CLASSES[size],
              'transition-all',
              !readonly &&
                'cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:rounded',
              readonly && 'cursor-default',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
          >
            <span className={star <= value ? 'text-yellow-500' : 'text-gray-300'}>★</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
