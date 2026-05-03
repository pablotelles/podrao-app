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
}

// ─── Multi-select ────────────────────────────────────────────────────────────

interface ToggleGroupMultiProps<T extends string> {
  mode: 'multi';
  options: readonly T[];
  value: T[];
  onChange: (value: T[]) => void;
  renderLabel?: (option: T) => ReactNode;
  className?: string;
}

type ToggleGroupProps<T extends string> =
  | ToggleGroupSingleProps<T>
  | ToggleGroupMultiProps<T>;

/**
 * Pill toggle group — single or multi select.
 *
 * Usage (single):
 *   <ToggleGroup mode="single" options={MEAL_TYPES} value={val} onChange={setVal} />
 *
 * Usage (multi):
 *   <ToggleGroup mode="multi" options={CUISINE_TYPES} value={arr} onChange={setArr} />
 */
export function ToggleGroup<T extends string>({
  mode,
  options,
  renderLabel,
  className = '',
  ...rest
}: ToggleGroupProps<T>) {
  function isSelected(option: T): boolean {
    if (mode === 'single') return (rest as ToggleGroupSingleProps<T>).value === option;
    return (rest as ToggleGroupMultiProps<T>).value.includes(option);
  }

  function handleClick(option: T) {
    if (mode === 'single') {
      const { value, onChange } = rest as ToggleGroupSingleProps<T>;
      // clicking the same value deselects
      onChange(value === option ? undefined : option);
    } else {
      const { value, onChange } = rest as ToggleGroupMultiProps<T>;
      onChange(
        value.includes(option)
          ? value.filter((v) => v !== option)
          : [...value, option],
      );
    }
  }

  return (
    <div role="group" className={['flex flex-wrap gap-2', className].join(' ')}>
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
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              selected
                ? 'border-brand bg-brand-subtle text-brand font-medium'
                : 'border-border text-text-secondary hover:border-brand/50 hover:text-text-primary',
            ].join(' ')}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        );
      })}
    </div>
  );
}
