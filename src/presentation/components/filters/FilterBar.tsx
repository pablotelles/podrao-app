'use client';

import { useState } from 'react';
import { Button, Sheet, Badge } from '@/presentation/components/ui';
import { MEAL_TYPES } from '@/domain/value-objects/MealType';
import { CUISINE_TYPES } from '@/domain/value-objects/CuisineType';
import { PRICE_BUCKETS, PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import type { MealType } from '@/domain/value-objects/MealType';
import type { CuisineType } from '@/domain/value-objects/CuisineType';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

export interface FilterValues {
  mealType?: MealType;
  cuisine?: CuisineType;
  priceBucket?: PriceBucket;
  radiusMeters?: number;
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

const RADIUS_OPTIONS = [500, 1000, 2000, 3000, 5000] as const;

export function FilterBar({ values, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(values).filter(Boolean).length;

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Filtros {activeCount > 0 && <Badge variant="brand">{activeCount}</Badge>}
        </Button>

        {values.mealType && (
          <Badge variant="brand" className="cursor-pointer" onClick={() => onChange({ ...values, mealType: undefined })}>
            {values.mealType} ✕
          </Badge>
        )}
        {values.cuisine && (
          <Badge variant="brand" className="cursor-pointer" onClick={() => onChange({ ...values, cuisine: undefined })}>
            {values.cuisine} ✕
          </Badge>
        )}
        {values.priceBucket && (
          <Badge variant="brand" className="cursor-pointer" onClick={() => onChange({ ...values, priceBucket: undefined })}>
            {PRICE_BUCKET_LABELS[values.priceBucket]} ✕
          </Badge>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Filtros">
        <div className="flex flex-col gap-6">
          <FilterSection
            label="Refeição"
            options={MEAL_TYPES as unknown as string[]}
            selected={values.mealType}
            onSelect={(v) => onChange({ ...values, mealType: v as MealType | undefined })}
          />
          <FilterSection
            label="Cozinha"
            options={CUISINE_TYPES as unknown as string[]}
            selected={values.cuisine}
            onSelect={(v) => onChange({ ...values, cuisine: v as CuisineType | undefined })}
          />
          <FilterSection
            label="Faixa de preço"
            options={PRICE_BUCKETS as unknown as string[]}
            selected={values.priceBucket}
            labels={PRICE_BUCKET_LABELS as unknown as Record<string, string>}
            onSelect={(v) => onChange({ ...values, priceBucket: v as PriceBucket | undefined })}
          />
          <FilterSection
            label="Raio de busca"
            options={RADIUS_OPTIONS.map(String)}
            selected={values.radiusMeters !== undefined ? String(values.radiusMeters) : undefined}
            labels={Object.fromEntries(
              RADIUS_OPTIONS.map((r) => [String(r), r < 1000 ? `${r}m` : `${r / 1000}km`]),
            )}
            onSelect={(v) => onChange({ ...values, radiusMeters: v !== undefined ? Number(v) : undefined })}
          />

          <Button onClick={() => { onChange({}); setOpen(false); }} variant="ghost">
            Limpar filtros
          </Button>
        </div>
      </Sheet>
    </>
  );
}

interface FilterSectionProps {
  label: string;
  options: string[];
  selected?: string;
  labels?: Record<string, string>;
  onSelect: (value: string | undefined) => void;
}

function FilterSection({ label, options, selected, labels, onSelect }: FilterSectionProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text-primary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(selected === opt ? undefined : opt)}
            className={[
              'rounded-full border px-3 py-1 text-sm transition-colors',
              selected === opt
                ? 'border-brand bg-brand-subtle text-brand'
                : 'border-border text-text-secondary',
            ].join(' ')}
          >
            {labels?.[opt] ?? opt}
          </button>
        ))}
      </div>
    </div>
  );
}
