'use client';
import { RadioListItem } from '@/presentation/components/ui';
import { PRICE_BUCKETS, PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';

interface StepPriceProps {
  value?: string;
  onChange: (v: string) => void;
}

const PRICE_HINTS: Record<string, string> = {
  up_to_15: 'Pratos rápidos, salgados, snacks',
  '15_25': 'Almoço simples, PF, lanches',
  '25_40': 'Prato individual, combos',
  '40_70': 'Prato para dois, especialidades',
  '70_plus': 'Alta gastronomia, experiências',
};

const PRICE_ICONS: Record<string, string> = {
  up_to_15: 'R$\u00a0',
  '15_25': 'R$ R$',
  '25_40': 'R$ R$ R$',
  '40_70': 'R$ R$ R$ R$',
  '70_plus': 'R$ R$ R$ R$ R$',
};

export function StepPrice({ value, onChange }: StepPriceProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Qual a faixa de preço?</h2>
      <div className="flex flex-col">
        {PRICE_BUCKETS.map((bucket) => (
          <RadioListItem
            key={bucket}
            icon={PRICE_ICONS[bucket]}
            label={PRICE_BUCKET_LABELS[bucket]}
            description={PRICE_HINTS[bucket]}
            selected={value === bucket}
            onSelect={() => onChange(bucket)}
          />
        ))}
      </div>
    </div>
  );
}
