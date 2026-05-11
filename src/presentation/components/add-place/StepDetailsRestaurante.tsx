'use client';

import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
import { FieldGroup, ChipWrap, RadioItem, PeriodChips } from './shared';

const SERVICE_TYPES = [
  'À la carte',
  'Self-service por quilo',
  'Prato feito',
  'Buffet livre',
] as const;
type ServiceType = (typeof SERVICE_TYPES)[number];

const FOOD_TAGS = [
  'Comida caseira',
  'Churrasco',
  'Pizza',
  'Sushi / japonesa',
  'Nordestina',
  'Árabe',
  'Mexicana',
  'Asiática',
  'Hambúrguer',
  'Vegano',
  'Frutos do mar',
] as const;
type FoodTag = (typeof FOOD_TAGS)[number];

const PAYMENT_METHODS = ['VR', 'VA', 'Pix', 'Cartão', 'Dinheiro'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const RESTAURANTE_PERIODS = [
  'manha',
  'tarde',
  'noite',
] as const satisfies readonly OperatingPeriod[];

/* ── Props ──────────────────────────────────────────────────────── */

interface StepDetailsRestauranteProps {
  serviceType?: ServiceType;
  onServiceTypeChange: (v: ServiceType | undefined) => void;
  serviceTypeError?: string;
  foodTags: FoodTag[];
  onFoodTagsChange: (v: FoodTag[]) => void;
  paymentMethods: PaymentMethod[];
  onPaymentMethodsChange: (v: PaymentMethod[]) => void;
  periods: OperatingPeriod[];
  onPeriodsChange: (v: OperatingPeriod[]) => void;
  periodsError?: string;
}

export function StepDetailsRestaurante({
  serviceType,
  onServiceTypeChange,
  serviceTypeError,
  foodTags,
  onFoodTagsChange,
  paymentMethods,
  onPaymentMethodsChange,
  periods,
  onPeriodsChange,
  periodsError,
}: StepDetailsRestauranteProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div>
        <h1 className="text-[18px] font-bold leading-snug tracking-tight text-text-primary">
          Conta mais sobre o restaurante
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ajuda quem tá procurando saber o que esperar.
        </p>
      </div>

      {/* service_type */}
      <FieldGroup label="Como funciona?">
        <div className="flex flex-col gap-2">
          {SERVICE_TYPES.map((type) => (
            <RadioItem
              key={type}
              label={type}
              selected={serviceType === type}
              onClick={() => onServiceTypeChange(serviceType === type ? undefined : type)}
            />
          ))}
        </div>
        {serviceTypeError && <p className="text-xs text-error">{serviceTypeError}</p>}
      </FieldGroup>

      {/* food_tags */}
      <FieldGroup label="Foco da comida" optional hint="máx 3">
        <ChipWrap options={FOOD_TAGS} value={foodTags} onChange={onFoodTagsChange} max={3} />
      </FieldGroup>

      {/* payment_methods */}
      <FieldGroup label="Formas de pagamento" optional>
        <ChipWrap
          options={PAYMENT_METHODS}
          value={paymentMethods}
          onChange={onPaymentMethodsChange}
        />
      </FieldGroup>

      {/* operating_periods */}
      <FieldGroup label="Quando funciona?">
        <PeriodChips periods={RESTAURANTE_PERIODS} value={periods} onChange={onPeriodsChange} />
        {periodsError && <p className="text-xs text-error">{periodsError}</p>}
      </FieldGroup>
    </div>
  );
}
