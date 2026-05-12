'use client';

import { useState } from 'react';
import { Badge } from '@/presentation/components/ui';
import { Sheet } from '@/presentation/components/ui/Sheet';
import { OPERATING_PERIODS, OPERATING_PERIOD_META } from '@/domain/value-objects/OperatingPeriod';
import { PRICE_BUCKETS, PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';
import { RADIUS_MIN, RADIUS_MAX, RADIUS_STEP } from '@/presentation/hooks/useSearchRadius';
import {
  TypeSelector,
  type EstablishmentTypeFilter,
} from '@/presentation/components/home/TypeSelector';
import {
  ContextualFilters,
  type ContextualFilterValues,
} from '@/presentation/components/home/ContextualFilters';

export interface FilterValues {
  period?: OperatingPeriod;
  priceBucket?: PriceBucket;
  radiusMeters?: number;
  establishmentType?: EstablishmentTypeFilter;
  contextual?: ContextualFilterValues;
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  /** Controlled open state. When provided, hides internal trigger button. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatRadius(m: number): string {
  return m < 1000 ? `${m}m` : `${m / 1000}km`;
}

/** Returns total count of active filters for the badge */
function countActiveFilters(values: FilterValues): number {
  let count = 0;
  if (values.establishmentType) count++;
  if (values.period) count++;
  if (values.priceBucket) count++;
  if (values.radiusMeters && values.radiusMeters !== RADIUS_MIN) count++;
  const ctx = values.contextual ?? {};
  if (ctx.serviceType) count++;
  if (ctx.foodTag) count++;
  if (ctx.barFocus) count++;
  if (ctx.drinkTag) count++;
  if (ctx.hasHappyHour) count++;
  if (ctx.specialtyTag) count++;
  if (ctx.opensEarly) count++;
  return count;
}

function FilterGroupLabel({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: 'var(--font-size-caption)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '0.625rem',
      }}
    >
      {children}
    </p>
  );
}

function PillGroup({
  options,
  selected,
  labels,
  onToggle,
}: {
  options: readonly string[];
  selected?: string | string[];
  labels?: Record<string, string>;
  onToggle: (value: string) => void;
}) {
  const selectedSet = new Set(
    Array.isArray(selected) ? selected : selected != null ? [selected] : [],
  );

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map((opt) => {
        const isActive = selectedSet.has(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            style={{
              height: '34px',
              padding: '0 0.875rem',
              borderRadius: 'var(--radius-full)',
              border: isActive
                ? '1.5px solid var(--color-brand)'
                : '1.5px solid var(--color-border)',
              background: isActive ? 'var(--color-brand)' : 'var(--color-bg)',
              color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-label)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              transition: 'border-color 0.15s, background 0.15s, color 0.15s',
            }}
          >
            {labels?.[opt] ?? opt}
          </button>
        );
      })}
    </div>
  );
}

export function FilterBar({ values, onChange, open: openProp, onOpenChange }: FilterBarProps) {
  const [openInternal, setOpenInternal] = useState(false);
  // Draft state — only committed to parent on "Aplicar"
  const [draft, setDraft] = useState<FilterValues>(values);

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;

  const setOpen = (v: boolean) => {
    if (isControlled) {
      onOpenChange?.(v);
    } else {
      setOpenInternal(v);
    }
    // Sync draft with current values when opening
    if (v) setDraft(values);
  };

  const activeCount = countActiveFilters(values);

  function handleApply() {
    onChange(draft);
    setOpen(false);
  }

  function handleClear() {
    const cleared: FilterValues = { radiusMeters: RADIUS_MIN };
    setDraft(cleared);
  }

  function togglePeriod(p: string) {
    const current = draft.period;
    setDraft({ ...draft, period: current === p ? undefined : (p as OperatingPeriod) });
  }

  function togglePrice(p: string) {
    const current = draft.priceBucket;
    setDraft({ ...draft, priceBucket: current === p ? undefined : (p as PriceBucket) });
  }

  if (!open) {
    return (
      <>
        {!isControlled && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                height: '34px',
                padding: '0 0.875rem',
                borderRadius: 'var(--radius-full)',
                border:
                  activeCount > 0
                    ? '1.5px solid var(--color-brand)'
                    : '1.5px solid var(--color-border)',
                background: activeCount > 0 ? 'var(--color-brand-subtle)' : 'var(--color-bg)',
                color: activeCount > 0 ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-label)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
              }}
            >
              Filtros
              {activeCount > 0 && <Badge variant="brand">{activeCount}</Badge>}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title="Filtros"
      footer={
        <div className="flex items-center gap-3 border-t border-border bg-bg px-(--spacing-page-x) py-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex h-10.5 flex-1 items-center justify-center rounded-full border border-border text-text-secondary"
            style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)' }}
          >
            Limpar filtros
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex h-10.5 flex-2 items-center justify-center gap-1.5 rounded-full bg-brand text-text-inverse"
            style={{
              fontSize: 'var(--font-size-label)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Aplicar
          </button>
        </div>
      }
    >
      {/* (1) Tipo de estabelecimento */}
      <div style={{ marginTop: '0.75rem' }}>
        <FilterGroupLabel>Tipo de estabelecimento</FilterGroupLabel>
        <TypeSelector
          value={draft.establishmentType ?? null}
          onChange={(v) =>
            setDraft({ ...draft, establishmentType: v ?? undefined, contextual: {} })
          }
        />
      </div>

      {/* (2) Período de funcionamento */}
      <div style={{ marginTop: '1.25rem' }}>
        <FilterGroupLabel>Período de funcionamento</FilterGroupLabel>
        <PillGroup
          options={OPERATING_PERIODS}
          selected={draft.period}
          labels={Object.fromEntries(
            OPERATING_PERIODS.map((p) => [
              p,
              `${OPERATING_PERIOD_META[p].emoji} ${OPERATING_PERIOD_META[p].label}`,
            ]),
          )}
          onToggle={togglePeriod}
        />
      </div>

      {/* (3) Faixa de preço */}
      <div style={{ marginTop: '1.25rem' }}>
        <FilterGroupLabel>Faixa de preço</FilterGroupLabel>
        <PillGroup
          options={PRICE_BUCKETS}
          selected={draft.priceBucket}
          labels={PRICE_BUCKET_LABELS as unknown as Record<string, string>}
          onToggle={togglePrice}
        />
      </div>

      {/* (4) Raio de busca */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="mb-2 flex items-center justify-between">
          <FilterGroupLabel>Raio de busca</FilterGroupLabel>
          <span
            className="text-brand"
            style={{
              fontSize: 'var(--font-size-label)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {formatRadius(draft.radiusMeters ?? RADIUS_MIN)}
          </span>
        </div>
        <input
          type="range"
          min={RADIUS_MIN}
          max={RADIUS_MAX}
          step={RADIUS_STEP}
          value={draft.radiusMeters ?? RADIUS_MIN}
          onChange={(e) => setDraft({ ...draft, radiusMeters: Number(e.target.value) })}
          className="w-full accent-brand"
        />
        <div className="mt-1 flex justify-between">
          <span className="text-text-disabled" style={{ fontSize: 'var(--font-size-caption)' }}>
            500m
          </span>
          <span className="text-text-disabled" style={{ fontSize: 'var(--font-size-caption)' }}>
            50km
          </span>
        </div>
      </div>

      {/* (5) Seção Contextual */}
      <ContextualFilters
        establishmentType={draft.establishmentType ?? null}
        values={draft.contextual ?? {}}
        onChange={(ctx) => setDraft({ ...draft, contextual: ctx })}
      />
    </Sheet>
  );
}
