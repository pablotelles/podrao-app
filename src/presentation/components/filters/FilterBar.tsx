'use client';

import { useState } from 'react';
import { Badge } from '@/presentation/components/ui';
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
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        style={{ zIndex: 'var(--z-overlay)' }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        className="fixed bottom-0 left-0 right-0 rounded-t-lg bg-bg"
        style={{
          zIndex: 'var(--z-modal)',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '85dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle + title — fixed at top */}
        <div
          style={{
            flexShrink: 0,
            padding: '0 var(--spacing-page-x) 0.75rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              background: 'var(--color-border)',
              borderRadius: 'var(--radius-full)',
              margin: '0.75rem auto 0',
            }}
          />
          <h2
            style={{
              fontSize: 'var(--font-size-subheading)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              letterSpacing: 'var(--letter-spacing-snug)',
              marginTop: '0.875rem',
            }}
          >
            Filtros
          </h2>
        </div>

        {/* Scrollable area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 var(--spacing-page-x)',
            paddingBottom: '1rem',
            overscrollBehavior: 'contain',
          }}
        >
          {/* (1) Tipo de estabelecimento */}
          <div style={{ marginTop: '0.75rem' }}>
            <FilterGroupLabel>Tipo de estabelecimento</FilterGroupLabel>
            <TypeSelector
              value={draft.establishmentType ?? null}
              onChange={(v) => {
                // Clear contextual when type changes
                setDraft({
                  ...draft,
                  establishmentType: v ?? undefined,
                  contextual: {},
                });
              }}
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <FilterGroupLabel>Raio de busca</FilterGroupLabel>
              <span
                style={{
                  fontSize: 'var(--font-size-label)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-brand)',
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
            <div
              style={{
                marginTop: '0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span className="text-text-disabled" style={{ fontSize: 'var(--font-size-caption)' }}>
                500m
              </span>
              <span className="text-text-disabled" style={{ fontSize: 'var(--font-size-caption)' }}>
                50km
              </span>
            </div>
          </div>

          {/* (5) Seção Contextual — animada */}
          <ContextualFilters
            establishmentType={draft.establishmentType ?? null}
            values={draft.contextual ?? {}}
            onChange={(ctx) => setDraft({ ...draft, contextual: ctx })}
          />

          <div style={{ height: '0.5rem' }} />
        </div>

        {/* Fixed footer */}
        <div
          style={{
            flexShrink: 0,
            padding: '0.75rem var(--spacing-page-x)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--color-bg)',
          }}
        >
          <button
            type="button"
            onClick={handleClear}
            style={{
              flex: 1,
              height: '42px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-label)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Limpar filtros
          </button>
          <button
            type="button"
            onClick={handleApply}
            style={{
              flex: 2,
              height: '42px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'var(--color-brand)',
              color: 'var(--color-text-inverse)',
              fontSize: 'var(--font-size-label)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
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
      </div>
    </>
  );
}
