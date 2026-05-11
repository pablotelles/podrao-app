'use client';

import type { EstablishmentType } from '@/domain/value-objects/EstablishmentType';
import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
import { StepDetailsRestaurante } from './StepDetailsRestaurante';
import { StepDetailsBar } from './StepDetailsBar';
import { StepDetailsPadaria } from './StepDetailsPadaria';

interface StepDetailsProps {
  establishmentType: EstablishmentType;
  attributes: Record<string, string[]>;
  onAttributeChange: (key: string, value: string[]) => void;
  periods: OperatingPeriod[];
  onPeriodsChange: (v: OperatingPeriod[]) => void;
  periodsError?: string;
}

export function StepDetails({
  establishmentType,
  attributes,
  onAttributeChange,
  periods,
  onPeriodsChange,
  periodsError,
}: StepDetailsProps) {
  function getAttr(key: string): string[] {
    return attributes[key] ?? [];
  }

  function setAttr(key: string, value: string[]) {
    onAttributeChange(key, value);
  }

  function getAttrFirst(key: string): string | undefined {
    return getAttr(key)[0];
  }

  function setAttrFirst(key: string, value: string | undefined) {
    setAttr(key, value ? [value] : []);
  }

  if (establishmentType === 'restaurante') {
    return (
      <StepDetailsRestaurante
        serviceType={
          getAttrFirst('service_type') as Parameters<
            typeof StepDetailsRestaurante
          >[0]['serviceType']
        }
        onServiceTypeChange={(v) => setAttrFirst('service_type', v)}
        foodTags={getAttr('food_tags') as Parameters<typeof StepDetailsRestaurante>[0]['foodTags']}
        onFoodTagsChange={(v) => setAttr('food_tags', v)}
        paymentMethods={
          getAttr('payment_methods') as Parameters<
            typeof StepDetailsRestaurante
          >[0]['paymentMethods']
        }
        onPaymentMethodsChange={(v) => setAttr('payment_methods', v)}
        periods={periods}
        onPeriodsChange={onPeriodsChange}
        periodsError={periodsError}
      />
    );
  }

  if (establishmentType === 'bar') {
    return (
      <StepDetailsBar
        barFocus={getAttrFirst('bar_focus') as Parameters<typeof StepDetailsBar>[0]['barFocus']}
        onBarFocusChange={(v) => setAttrFirst('bar_focus', v)}
        drinkTags={getAttr('drink_tags') as Parameters<typeof StepDetailsBar>[0]['drinkTags']}
        onDrinkTagsChange={(v) => setAttr('drink_tags', v)}
        hasHappyHour={getAttrFirst('has_happy_hour') === 'true'}
        onHasHappyHourChange={(v) => setAttrFirst('has_happy_hour', String(v))}
        periods={periods}
        onPeriodsChange={onPeriodsChange}
        periodsError={periodsError}
      />
    );
  }

  if (establishmentType === 'padaria') {
    return (
      <StepDetailsPadaria
        specialtyTags={
          getAttr('specialty_tags') as Parameters<typeof StepDetailsPadaria>[0]['specialtyTags']
        }
        onSpecialtyTagsChange={(v) => setAttr('specialty_tags', v)}
        opensEarly={getAttrFirst('opens_early') === 'true'}
        onOpensEarlyChange={(v) => setAttrFirst('opens_early', String(v))}
        periods={periods}
        onPeriodsChange={onPeriodsChange}
        periodsError={periodsError}
      />
    );
  }

  return null;
}
