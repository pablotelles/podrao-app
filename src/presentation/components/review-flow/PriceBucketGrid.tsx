'use client';

import {
  PRICE_BUCKETS,
  PRICE_BUCKET_LABELS,
  PRICE_BUCKET_SYMBOL,
} from '@/domain/value-objects/PriceBucket';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

interface PriceBucketGridProps {
  value: PriceBucket | undefined;
  onChange: (v: PriceBucket | undefined) => void;
}

export function PriceBucketGrid({ value, onChange }: PriceBucketGridProps) {
  const handleClick = (bucket: PriceBucket) => {
    onChange(value === bucket ? undefined : bucket);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {PRICE_BUCKETS.map((bucket) => (
        <button
          key={bucket}
          type="button"
          onClick={() => handleClick(bucket)}
          className={[
            'rounded-md border-[1.5px] px-2.5 py-3 text-center transition-all',
            value === bucket
              ? 'border-brand bg-brand-subtle'
              : 'border-border bg-bg hover:border-brand',
          ].join(' ')}
        >
          <p
            className={[
              'text-[13px] font-bold',
              value === bucket ? 'text-brand' : 'text-text-primary',
            ].join(' ')}
          >
            {PRICE_BUCKET_LABELS[bucket]}
          </p>
          <p className="mt-0.5 text-[11px] text-text-secondary">{PRICE_BUCKET_SYMBOL[bucket]}</p>
        </button>
      ))}
    </div>
  );
}
