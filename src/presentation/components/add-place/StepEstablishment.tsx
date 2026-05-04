'use client';
import { RadioListItem } from '@/presentation/components/ui';
import {
  ESTABLISHMENT_TYPES,
  ESTABLISHMENT_TYPE_META,
} from '@/domain/value-objects/EstablishmentType';

interface StepEstablishmentProps {
  value?: string;
  onChange: (v: string) => void;
  error?: string;
}

export function StepEstablishment({ value, onChange, error }: StepEstablishmentProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Qual o tipo de lugar?</h2>
      <div className="flex flex-col">
        {ESTABLISHMENT_TYPES.map((type) => (
          <RadioListItem
            key={type}
            icon={ESTABLISHMENT_TYPE_META[type].icon}
            label={type}
            selected={value === type}
            onSelect={() => onChange(type)}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}
