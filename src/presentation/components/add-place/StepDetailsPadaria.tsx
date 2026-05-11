'use client';

import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
import { FieldGroup, ChipWrap, PeriodChips, ToggleRow } from './shared';

const SPECIALTY_TAGS = [
  'Pão artesanal',
  'Café especial',
  'Doces / confeitaria',
  'Salgados',
  'Marmita / prato feito',
  'Vegano',
] as const;
type SpecialtyTag = (typeof SPECIALTY_TAGS)[number];

const PADARIA_PERIODS = ['manha', 'tarde'] as const satisfies readonly OperatingPeriod[];

/* ── Props ──────────────────────────────────────────────────────── */

interface StepDetailsPadariaProps {
  specialtyTags: SpecialtyTag[];
  onSpecialtyTagsChange: (v: SpecialtyTag[]) => void;
  specialtyTagsError?: string;
  opensEarly: boolean;
  onOpensEarlyChange: (v: boolean) => void;
  periods: OperatingPeriod[];
  onPeriodsChange: (v: OperatingPeriod[]) => void;
  periodsError?: string;
}

export function StepDetailsPadaria({
  specialtyTags,
  onSpecialtyTagsChange,
  specialtyTagsError,
  opensEarly,
  onOpensEarlyChange,
  periods,
  onPeriodsChange,
  periodsError,
}: StepDetailsPadariaProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div>
        <h1 className="text-[18px] font-bold leading-snug tracking-tight text-text-primary">
          Conta mais sobre a padaria
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ajuda quem tá procurando saber o que esperar.
        </p>
      </div>

      {/* specialty_tags */}
      <FieldGroup label="O que tem de especial?" hint="mín 1, máx 2">
        <ChipWrap
          options={SPECIALTY_TAGS}
          value={specialtyTags}
          onChange={onSpecialtyTagsChange}
          max={2}
        />
        {specialtyTagsError && <p className="text-xs text-error">{specialtyTagsError}</p>}
      </FieldGroup>

      {/* opens_early */}
      <FieldGroup label="Abre cedo" optional>
        <ToggleRow label="Abre antes das 8h?" checked={opensEarly} onChange={onOpensEarlyChange} />
      </FieldGroup>

      {/* operating_periods */}
      <FieldGroup label="Quando funciona?">
        <PeriodChips periods={PADARIA_PERIODS} value={periods} onChange={onPeriodsChange} />
        {periodsError && <p className="text-xs text-error">{periodsError}</p>}
      </FieldGroup>
    </div>
  );
}
