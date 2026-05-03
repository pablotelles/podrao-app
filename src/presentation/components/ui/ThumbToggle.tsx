'use client';

interface ThumbToggleProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  error?: string;
}

/**
 * Binary thumbs-up / thumbs-down toggle for reviews.
 */
export function ThumbToggle({ value, onChange, error }: ThumbToggleProps) {
  return (
    <div>
      <div className="flex gap-3" role="group" aria-label="Sua avaliação">
        <button
          type="button"
          role="radio"
          aria-checked={value === true}
          onClick={() => onChange(true)}
          className={[
            'flex h-12 w-12 items-center justify-center rounded-full text-2xl border-2 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            value === true ? 'border-success bg-green-50' : 'border-border hover:border-success/50',
          ].join(' ')}
          aria-label="Recomendo"
        >
          👍
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === false}
          onClick={() => onChange(false)}
          className={[
            'flex h-12 w-12 items-center justify-center rounded-full text-2xl border-2 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            value === false ? 'border-error bg-red-50' : 'border-border hover:border-error/50',
          ].join(' ')}
          aria-label="Não recomendo"
        >
          👎
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
