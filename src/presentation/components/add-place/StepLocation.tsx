'use client';

import { AddressAutocomplete } from '@/presentation/components/ui';
import { DynamicLocationPickerMap } from '@/presentation/components/maps/dynamic';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';

interface StepLocationProps {
  selected: AutocompleteResult | null;
  onSelect: (result: AutocompleteResult) => void;
  onClear: () => void;
  onGpsClick: () => void;
  geoLoading?: boolean;
  geocoding?: boolean;
  geoError?: string;
  formLat?: number;
  formLng?: number;
  onLocationChange: (lat: number, lng: number) => void;
  locationError?: string;
}

export function StepLocation({
  selected,
  onSelect,
  onClear,
  onGpsClick,
  geoLoading,
  geocoding,
  geoError,
  formLat,
  formLng,
  onLocationChange,
  locationError,
}: StepLocationProps) {
  const hasLocation = typeof formLat === 'number' && typeof formLng === 'number';
  return (
    <>
      <AddressAutocomplete
        selected={selected}
        onSelect={onSelect}
        onClear={onClear}
        error={locationError}
      />
      {hasLocation && (
        <DynamicLocationPickerMap
          lat={formLat!}
          lng={formLng!}
          onLocationChange={onLocationChange}
          height="150px"
        />
      )}
      <button
        type="button"
        onClick={onGpsClick}
        disabled={geoLoading || geocoding}
        className="flex items-center gap-1.5 text-sm text-brand disabled:opacity-50"
      >
        {geoLoading || geocoding ? 'Localizando...' : '📍 Usar minha localização atual'}
      </button>
      {geoError && <p className="text-xs text-error">{geoError}</p>}
    </>
  );
}
