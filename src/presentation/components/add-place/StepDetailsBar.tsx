'use client';

import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
import { FieldGroup, ChipWrap, RadioItem, PeriodChips, ToggleRow } from './shared';

const BAR_FOCUS_OPTIONS = ['Comida e bebida igual', 'Bebida com petisco', 'Só bebida'] as const;
type BarFocus = (typeof BAR_FOCUS_OPTIONS)[number];

const DRINK_TAGS = [
  'Chopp / cerveja',
  'Drinks / coquetelaria',
  'Vinho',
  'Cachaça / doses',
] as const;
type DrinkTag = (typeof DRINK_TAGS)[number];

const BAR_PERIODS = ['tarde', 'noite', 'madrugada'] as const satisfies readonly OperatingPeriod[];

/* ── Props ──────────────────────────────────────────────────────── */

interface StepDetailsBarProps {
  barFocus?: BarFocus;
  onBarFocusChange: (v: BarFocus | undefined) => void;
  barFocusError?: string;
  drinkTags: DrinkTag[];
  onDrinkTagsChange: (v: DrinkTag[]) => void;
  hasHappyHour: boolean;
  onHasHappyHourChange: (v: boolean) => void;
  periods: OperatingPeriod[];
  onPeriodsChange: (v: OperatingPeriod[]) => void;
  periodsError?: string;
}

export function StepDetailsBar({
  barFocus,
  onBarFocusChange,
  barFocusError,
  drinkTags,
  onDrinkTagsChange,
  hasHappyHour,
  onHasHappyHourChange,
  periods,
  onPeriodsChange,
  periodsError,
}: StepDetailsBarProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div>
        <h1 className="text-[18px] font-bold leading-snug tracking-tight text-text-primary">
          Conta mais sobre o boteco
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ajuda quem tá procurando saber o que esperar.
        </p>
      </div>

      {/* bar_focus */}
      <FieldGroup label="O foco é mais...">
        <div className="flex flex-col gap-2">
          {BAR_FOCUS_OPTIONS.map((opt) => (
            <RadioItem
              key={opt}
              label={opt}
              selected={barFocus === opt}
              onClick={() => onBarFocusChange(barFocus === opt ? undefined : opt)}
            />
          ))}
        </div>
        {barFocusError && <p className="text-xs text-error">{barFocusError}</p>}
      </FieldGroup>

      {/* drink_tags */}
      <FieldGroup label="O que brilha pra beber" optional hint="máx 2">
        <ChipWrap options={DRINK_TAGS} value={drinkTags} onChange={onDrinkTagsChange} max={2} />
      </FieldGroup>

      {/* has_happy_hour */}
      <FieldGroup label="Happy hour" optional>
        <ToggleRow label="Tem happy hour?" checked={hasHappyHour} onChange={onHasHappyHourChange} />
      </FieldGroup>

      {/* operating_periods */}
      <FieldGroup label="Quando funciona?">
        <PeriodChips periods={BAR_PERIODS} value={periods} onChange={onPeriodsChange} />
        {periodsError && <p className="text-xs text-error">{periodsError}</p>}
      </FieldGroup>
    </div>
  );
}
