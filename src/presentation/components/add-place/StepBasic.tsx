'use client';

import { Input, Text } from '@/presentation/components/ui';
import { StepLocation } from './StepLocation';
import {
  ESTABLISHMENT_TYPES,
  ESTABLISHMENT_TYPE_META,
} from '@/domain/value-objects/EstablishmentType';
import type { EstablishmentType } from '@/domain/value-objects/EstablishmentType';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';

interface StepBasicProps {
  nameError?: string;
  nameRegisterProps: React.InputHTMLAttributes<HTMLInputElement>;
  establishmentType?: EstablishmentType;
  onEstablishmentTypeChange: (v: EstablishmentType) => void;
  establishmentTypeError?: string;
  selectedAddress: AutocompleteResult | null;
  onAddressSelect: (result: AutocompleteResult) => void;
  onAddressClear: () => void;
  onGpsClick: () => void;
  geoLoading?: boolean;
  geocoding?: boolean;
  geoError?: string;
  formLat?: number;
  formLng?: number;
  onLocationChange: (lat: number, lng: number) => void;
  locationError?: string;
  numeroValue?: string;
  numeroError?: string;
  numeroRegisterProps: React.InputHTMLAttributes<HTMLInputElement>;
  onNumeroChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StepBasic({
  nameError,
  nameRegisterProps,
  establishmentType,
  onEstablishmentTypeChange,
  establishmentTypeError,
  selectedAddress,
  onAddressSelect,
  onAddressClear,
  onGpsClick,
  geoLoading,
  geocoding,
  geoError,
  formLat,
  formLng,
  onLocationChange,
  locationError,
  numeroError,
  numeroRegisterProps,
  onNumeroChange,
}: StepBasicProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div>
        <Text variant="heading" as="h1" className="leading-snug tracking-tight">
          Qual lugar é esse?
        </Text>
        <Text as="p" variant="body" textColor="secondary" className="mt-1">
          Informações para encontrarem no mapa.
        </Text>
      </div>

      {/* Nome */}
      <Input label="Nome do lugar" error={nameError} {...nameRegisterProps} />

      {/* Localização */}
      <StepLocation
        selected={selectedAddress}
        onSelect={onAddressSelect}
        onClear={onAddressClear}
        onGpsClick={onGpsClick}
        geoLoading={geoLoading}
        geocoding={geocoding}
        geoError={geoError}
        formLat={formLat}
        formLng={formLng}
        onLocationChange={onLocationChange}
        locationError={locationError}
      />

      {/* Número (aparece após localização preenchida) */}
      {formLat && formLng && (
        <Input
          label="Número"
          placeholder="ex: 123, s/n"
          error={numeroError}
          {...numeroRegisterProps}
          onChange={onNumeroChange}
        />
      )}

      {/* Tipo de estabelecimento — grid 3 colunas */}
      <div className="flex flex-col gap-1.5">
        <Text as="label" variant="label">
          Tipo de estabelecimento
        </Text>
        <div className="grid grid-cols-3 gap-2">
          {ESTABLISHMENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onEstablishmentTypeChange(type)}
              className={[
                'flex flex-col items-center gap-1.5 rounded-md border-[1.5px] px-2 py-3 transition-all',
                establishmentType === type
                  ? 'border-brand bg-brand-subtle shadow-[0_0_0_2px_var(--color-brand-subtle)]'
                  : 'border-border bg-bg hover:border-brand hover:bg-brand-subtle',
              ].join(' ')}
            >
              <span className="text-2xl leading-none">{ESTABLISHMENT_TYPE_META[type].icon}</span>
              <Text
                as="span"
                variant="caption"
                textColor={establishmentType === type ? 'brand' : 'primary'}
                className="text-center leading-tight"
              >
                {ESTABLISHMENT_TYPE_META[type].label}
              </Text>
            </button>
          ))}
        </div>
        {establishmentTypeError && (
          <Text as="p" variant="caption" textColor="error">
            {establishmentTypeError}
          </Text>
        )}
      </div>
    </div>
  );
}
