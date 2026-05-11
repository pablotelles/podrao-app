'use client';

import { useState } from 'react';
import { Button, Sheet, Badge } from '@/presentation/components/ui';
import { OPERATING_PERIODS, OPERATING_PERIOD_META } from '@/domain/value-objects/OperatingPeriod';
import { PRICE_BUCKETS, PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';

export interface FilterValues {
  period?: OperatingPeriod;
  priceBucket?: PriceBucket;
  radiusMeters?: number;
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  /** Controlled open state. When provided, hides internal trigger button. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RADIUS_OPTIONS = [500, 1000, 2000, 3000, 5000] as const;

export function FilterBar({ values, onChange, open: openProp, onOpenChange }: FilterBarProps) {
  const [openInternal, setOpenInternal] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;
  const setOpen = isControlled ? (v: boolean) => onOpenChange?.(v) : setOpenInternal;
  const activeCount = Object.values(values).filter(Boolean).length;

  return (
    <>
      {!isControlled && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Filtros {activeCount > 0 && <Badge variant="brand">{activeCount}</Badge>}
          </Button>
        </div>
      )}

      {!isControlled && values.period && (
        <Badge
          variant="brand"
          className="cursor-pointer"
          onClick={() => onChange({ ...values, period: undefined })}
        >
          {OPERATING_PERIOD_META[values.period].label} ✕
        </Badge>
      )}
      {!isControlled && values.priceBucket && (
        <Badge
          variant="brand"
          className="cursor-pointer"
          onClick={() => onChange({ ...values, priceBucket: undefined })}
        >
          {PRICE_BUCKET_LABELS[values.priceBucket]} ✕
        </Badge>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Filtros">
        <div className="flex flex-col gap-6">
          <FilterSection
            label="Período"
            options={OPERATING_PERIODS as unknown as string[]}
            selected={values.period}
            labels={Object.fromEntries(
              OPERATING_PERIODS.map((p) => [
                p,
                `${OPERATING_PERIOD_META[p].emoji} ${OPERATING_PERIOD_META[p].label}`,
              ]),
            )}
            onSelect={(v) => onChange({ ...values, period: v as OperatingPeriod | undefined })}
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
            onSelect={(v) =>
              onChange({ ...values, radiusMeters: v !== undefined ? Number(v) : undefined })
            }
          />

          <Button
            onClick={() => {
              onChange({});
              setOpen(false);
            }}
            variant="ghost"
            className="w-full"
          >
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
