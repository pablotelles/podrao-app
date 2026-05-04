'use client';

import { StarRating } from '@/presentation/components/ui';

interface StepRatingProps {
  value: number | undefined;
  onChange: (value: number) => void;
  error?: string;
}

export function StepRating({ value, onChange, error }: StepRatingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h2 className="mb-2 text-xl font-bold text-text-primary">
        Como foi sua experiência geralmente?
      </h2>
      <p className="mb-6 text-sm text-text-secondary text-center">
        Sua nota ajuda outras pessoas a conhecerem o lugar
      </p>
      <StarRating value={value ?? 0} onChange={onChange} size="lg" error={error} />
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
