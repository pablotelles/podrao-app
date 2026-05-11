'use client';

import type { ReactNode } from 'react';

// ─── Single-select ───────────────────────────────────────────────────────────

interface ToggleGroupSingleProps<T extends string> {
  mode: 'single';
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  renderLabel?: (option: T) => ReactNode;
  className?: string;
  variant?: 'default' | 'card';
}

// ─── Multi-select ────────────────────────────────────────────────────────────

interface ToggleGroupMultiProps<T extends string> {
  mode: 'multi';
  options: readonly T[];
  value: T[];
  onChange: (value: T[]) => void;
  renderLabel?: (option: T) => ReactNode;
  className?: string;
  variant?: 'default' | 'card';
  min?: number;
  max?: number;
}

type ToggleGroupProps<T extends string> = ToggleGroupSingleProps<T> | ToggleGroupMultiProps<T>;

/**
 * Pill toggle group — single or multi select.
 * variant="card" renders larger card-style buttons.
 *
 * Usage (single):
 *   <ToggleGroup mode="single" options={TYPES} value={val} onChange={setVal} />
 *
 * Usage (multi with limits):
 *   <ToggleGroup mode="multi" options={TAGS} value={arr} onChange={setArr} min={1} max={3} />
 */
export function ToggleGroup<T extends string>({
  mode,
  options,
  renderLabel,
  className = '',
  variant = 'default',
  ...rest
}: ToggleGroupProps<T>) {
  function isSelected(option: T): boolean {
    if (mode === 'single') return (rest as ToggleGroupSingleProps<T>).value === option;
    return (rest as ToggleGroupMultiProps<T>).value.includes(option);
  }

  function handleClick(option: T) {
    if (mode === 'single') {
      const { value, onChange } = rest as ToggleGroupSingleProps<T>;
      onChange(value === option ? undefined : option);
    } else {
      const { value, onChange, min, max } = rest as ToggleGroupMultiProps<T>;
      const already = value.includes(option);
      if (already) {
        if (min !== undefined && value.length <= min) return;
        onChange(value.filter((v) => v !== option));
      } else {
        if (max !== undefined && value.length >= max) return;
        onChange([...value, option]);
      }
    }
  }

  const isCard = variant === 'card';

  return (
    <div
      role="group"
      className={[isCard ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2', className].join(' ')}
    >
      {options.map((option) => {
        const selected = isSelected(option);
        return (
          <button
            key={option}
            type="button"
            role={mode === 'single' ? 'radio' : 'checkbox'}
            aria-checked={selected}
            onClick={() => handleClick(option)}
            className={[
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              isCard
                ? [
                    'w-full rounded-md border px-4 py-3 text-left text-sm font-medium',
                    selected
                      ? 'border-brand bg-brand-subtle text-brand'
                      : 'border-border text-text-primary hover:border-brand/50',
                  ].join(' ')
                : [
                    'rounded-full border px-4 py-1.5 text-sm',
                    selected
                      ? 'border-brand bg-brand-subtle text-brand font-medium'
                      : 'border-border text-text-secondary hover:border-brand/50 hover:text-text-primary',
                  ].join(' '),
            ].join(' ')}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        );
      })}
    </div>
  );
}
