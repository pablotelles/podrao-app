'use client';

import { OPERATING_PERIOD_META } from '@/domain/value-objects/OperatingPeriod';
import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';

/* ── BadgeOpcional ──────────────────────────────────────────────── */

export function BadgeOpcional() {
  return (
    <span className="ml-1.5 inline-block rounded-full border border-border bg-bg-subtle px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-text-secondary align-middle">
      Opcional
    </span>
  );
}

/* ── FieldGroup ─────────────────────────────────────────────────── */

export interface FieldGroupProps {
  label: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FieldGroup({ label, optional, hint, children }: FieldGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-primary">
        {label}
        {optional && <BadgeOpcional />}
        {hint && <span className="ml-1 text-xs font-normal text-text-secondary">{hint}</span>}
      </span>
      {children}
    </div>
  );
}

/* ── RadioItem ──────────────────────────────────────────────────── */

export interface RadioItemProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function RadioItem({ label, selected, onClick }: RadioItemProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className={[
        'flex cursor-pointer items-center gap-3 rounded-md border-[1.5px] px-3.5 py-3 transition-all',
        selected
          ? 'border-brand bg-brand-subtle'
          : 'border-border bg-bg hover:border-brand hover:bg-brand-subtle',
      ].join(' ')}
    >
      {/* Radio dot */}
      <div
        className={[
          'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          selected ? 'border-brand bg-brand' : 'border-border',
        ].join(' ')}
      >
        {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <span
        className={['text-[14px] font-medium', selected ? 'text-brand' : 'text-text-primary'].join(
          ' ',
        )}
      >
        {label}
      </span>
    </div>
  );
}

/* ── ChipWrap ───────────────────────────────────────────────────── */

export interface ChipWrapProps<T extends string> {
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
  max?: number;
}

export function ChipWrap<T extends string>({ options, value, onChange, max }: ChipWrapProps<T>) {
  const atMax = max !== undefined && value.length >= max;

  function toggle(opt: T) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (!atMax) {
      onChange([...value, opt]);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt);
          const disabled = atMax && !selected;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt)}
              className={[
                'rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-medium transition-all',
                selected
                  ? 'border-brand bg-brand-subtle text-brand'
                  : disabled
                    ? 'cursor-not-allowed border-border bg-bg-subtle text-text-disabled'
                    : 'border-border text-text-secondary hover:border-brand hover:text-brand',
              ].join(' ')}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {max !== undefined && (
        <p className="text-[11px] text-text-secondary">
          {value.length} de {max} selecionados
        </p>
      )}
    </div>
  );
}

/* ── PeriodChips ────────────────────────────────────────────────── */

export interface PeriodChipsProps {
  periods: readonly OperatingPeriod[];
  value: OperatingPeriod[];
  onChange: (v: OperatingPeriod[]) => void;
}

export function PeriodChips({ periods, value, onChange }: PeriodChipsProps) {
  function toggle(p: OperatingPeriod) {
    if (value.includes(p)) {
      onChange(value.filter((v) => v !== p));
    } else {
      onChange([...value, p]);
    }
  }

  return (
    <div className="flex gap-2">
      {periods.map((p) => {
        const selected = value.includes(p);
        const meta = OPERATING_PERIOD_META[p];
        return (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className={[
              'flex-1 rounded-md border-[1.5px] py-2.5 text-center text-[13px] font-medium transition-all',
              selected
                ? 'border-brand bg-brand-subtle text-brand font-semibold'
                : 'border-border text-text-secondary hover:border-brand',
            ].join(' ')}
          >
            {meta.emoji} {meta.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── ToggleRow ──────────────────────────────────────────────────── */

export interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-md border-[1.5px] border-border px-4 py-3.5">
      <span className="text-[14px] font-medium text-text-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6.5 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-brand' : 'bg-border',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.75 h-5 w-5 rounded-full bg-white shadow-(--shadow-toggle-thumb) transition-transform duration-200',
            checked ? 'left-0.75 translate-x-4.5' : 'left-0.75',
          ].join(' ')}
        />
      </button>
    </div>
  );
}
