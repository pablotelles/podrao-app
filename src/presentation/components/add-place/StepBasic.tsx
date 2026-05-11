'use client';

import { Input } from '@/presentation/components/ui';
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
        <h1 className="text-[18px] font-bold leading-snug tracking-tight text-text-primary">
          Qual lugar é esse?
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Informações para encontrarem no mapa.</p>
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
        <label className="text-[13px] font-semibold text-text-primary">
          Tipo de estabelecimento
        </label>
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
              <span
                className={[
                  'text-center text-[11px] font-semibold leading-tight',
                  establishmentType === type ? 'text-brand' : 'text-text-primary',
                ].join(' ')}
              >
                {ESTABLISHMENT_TYPE_META[type].label}
              </span>
            </button>
          ))}
        </div>
        {establishmentTypeError && <p className="text-xs text-error">{establishmentTypeError}</p>}
      </div>
    </div>
  );
}
