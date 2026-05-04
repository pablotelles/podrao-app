'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { createPlaceSchema, type CreatePlaceInput } from '@/presentation/lib/forms/place/schema';
import { createPlaceInitialValues } from '@/presentation/lib/forms/place/initialValues';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useAddPlace } from '@/presentation/hooks/useAddPlace';
import {
  Button,
  Input,
  PageHeader,
  PageContent,
  ProgressSteps,
} from '@/presentation/components/ui';
import { StepLocation } from '@/presentation/components/add-place/StepLocation';
import { StepMealTypes } from '@/presentation/components/add-place/StepMealTypes';
import { StepEstablishment } from '@/presentation/components/add-place/StepEstablishment';
import { StepCuisine } from '@/presentation/components/add-place/StepCuisine';
import { StepPrice } from '@/presentation/components/add-place/StepPrice';
import { StepPhoto } from '@/presentation/components/add-place/StepPhoto';
import type { MealType } from '@/domain/value-objects/MealType';
import type { CuisineType } from '@/domain/value-objects/CuisineType';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';

const ESTADO_SIGLAS: Record<string, string> = {
  Acre: 'AC',
  Alagoas: 'AL',
  Amapá: 'AP',
  Amazonas: 'AM',
  Bahia: 'BA',
  Ceará: 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  Goiás: 'GO',
  Maranhão: 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  Pará: 'PA',
  Paraíba: 'PB',
  Paraná: 'PR',
  Pernambuco: 'PE',
  Piauí: 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  Rondônia: 'RO',
  Roraima: 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  Sergipe: 'SE',
  Tocantins: 'TO',
};

function toEstadoSigla(state: string): string {
  if (state.length === 2) return state.toUpperCase();
  return ESTADO_SIGLAS[state] ?? state.slice(0, 2).toUpperCase();
}

const STEP_FIELDS: (keyof CreatePlaceInput)[][] = [
  ['name', 'numero', 'lat', 'lng'],
  ['mealTypes'],
  ['establishmentType'],
  ['cuisineTypes'],
  ['priceBucket'],
  [],
];

const STEPS = ['Local', 'Refeições', 'Tipo', 'Cozinha', 'Preço', 'Foto'] as const;

export default function AddPlacePage() {
  const router = useRouter();
  const geo = useGeolocation();
  const { submit, uploadPhoto, loading, error: submitError } = useAddPlace();
  const [step, setStep] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AutocompleteResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useZodForm<CreatePlaceInput>({
    schema: createPlaceSchema,
    defaultValues: createPlaceInitialValues,
  });

  const mealTypes = watch('mealTypes') ?? [];
  const cuisineTypes = watch('cuisineTypes') ?? [];
  const formLat = watch('lat');
  const formLng = watch('lng');
  const formAddress = watch('address');
  const formNumero = watch('numero');
  const formCidade = watch('cidade');
  const formEstado = watch('estado');

  useEffect(() => {
    if (!formLat && !formLng) return;
    console.log('[add-place] endereço completo:', {
      address: formAddress,
      numero: formNumero,
      cidade: formCidade,
      estado: formEstado,
      lat: formLat,
      lng: formLng,
    });
  }, [formAddress, formNumero, formCidade, formEstado, formLat, formLng]);

  const applyReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setGeocoding(true);
      try {
        const r = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
        const data = (await r.json()) as {
          displayName?: string;
          address?: Record<string, string>;
        };
        if (data.address) {
          if (data.address.road) setValue('address', data.address.road, { shouldValidate: true });
          setValue('numero', data.address.house_number ?? 's/n', { shouldValidate: true });
          if (data.address.city) setValue('cidade', data.address.city, { shouldValidate: true });
          if (data.address.state)
            setValue('estado', toEstadoSigla(data.address.state), { shouldValidate: true });
          if (data.address.neighbourhood) setValue('bairro', data.address.neighbourhood);
          setSelectedAddress({
            lat,
            lng,
            displayName: data.displayName ?? '',
            displayPlace: data.address.road ?? data.displayName ?? '',
            displayAddress: [data.address.neighbourhood, data.address.city, data.address.state]
              .filter(Boolean)
              .join(', '),
            address: {
              road: data.address.road,
              houseNumber: data.address.house_number,
              neighbourhood: data.address.neighbourhood,
              city: data.address.city,
              state: data.address.state,
            },
          });
        }
      } catch (e) {
        console.error('[add-place] Erro no reverse geocoding:', e);
      } finally {
        setGeocoding(false);
      }
    },
    [setValue, setSelectedAddress],
  );

  const handleAddressSelect = useCallback(
    (result: AutocompleteResult) => {
      setValue('lat', result.lat, { shouldValidate: true });
      setValue('lng', result.lng, { shouldValidate: true });
      setValue('address', result.address.road ?? result.displayPlace, { shouldValidate: true });
      setValue('numero', result.address.houseNumber ?? 's/n', { shouldValidate: true });
      setValue('cidade', result.address.city ?? '', { shouldValidate: true });
      if (result.address.state)
        setValue('estado', toEstadoSigla(result.address.state), { shouldValidate: true });
      if (result.address.neighbourhood) setValue('bairro', result.address.neighbourhood);
      setSelectedAddress(result);
    },
    [setValue, setSelectedAddress],
  );

  const numeroDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geocodeWithNumero = useCallback(
    async (numero: string) => {
      if (!selectedAddress?.address.road || !numero.trim() || numero === 's/n') return;
      const query = [
        selectedAddress.address.road,
        numero,
        selectedAddress.address.city,
        selectedAddress.address.state,
      ]
        .filter(Boolean)
        .join(', ');
      try {
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const data = (await r.json()) as { lat?: number; lng?: number };
        if (data.lat && data.lng) {
          setValue('lat', data.lat, { shouldValidate: true });
          setValue('lng', data.lng, { shouldValidate: true });
        }
      } catch {
        // geocoding failure is non-fatal — pin stays at current position
      }
    },
    [selectedAddress, setValue],
  );

  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      setValue('lat', lat, { shouldValidate: true });
      setValue('lng', lng, { shouldValidate: true });
      void applyReverseGeocode(lat, lng);
    },
    [setValue, applyReverseGeocode],
  );

  useEffect(() => {
    if (!geo.lat || !geo.lng) return;
    setValue('lat', geo.lat, { shouldValidate: true });
    setValue('lng', geo.lng, { shouldValidate: true });
    void applyReverseGeocode(geo.lat, geo.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.lat, geo.lng]);

  async function onSubmit(data: CreatePlaceInput) {
    let photoUrl: string | undefined;
    if (photoFile) {
      const url = await uploadPhoto(photoFile);
      if (url) photoUrl = url;
    }
    const place = await submit({ ...data, photoUrl });
    if (place) setSubmitted(true);
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader
        title={STEPS[step]}
        showBackButton
        onBack={handleBack}
        sticky
      />

      <PageContent className="mx-auto w-full max-w-lg flex-1 pb-28">
        <div className="mb-6">
          <ProgressSteps currentStep={step} totalSteps={STEPS.length} labels={STEPS} />
        </div>

        <form id="add-place-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <Input label="Nome do lugar" error={errors.name?.message} {...register('name')} />
              <StepLocation
                selected={selectedAddress}
                onSelect={handleAddressSelect}
                onClear={() => setSelectedAddress(null)}
                onGpsClick={geo.request}
                geoLoading={geo.loading}
                geocoding={geocoding}
                geoError={geo.error ?? undefined}
                formLat={formLat}
                formLng={formLng}
                onLocationChange={handleLocationChange}
                locationError={errors.lat?.message ?? errors.lng?.message}
              />
              {formLat && formLng && (
                <Input
                  label="Número"
                  placeholder="ex: 123, s/n"
                  error={errors.numero?.message}
                  {...register('numero')}
                  onChange={(e) => {
                    void register('numero').onChange(e);
                    if (numeroDebounceRef.current) clearTimeout(numeroDebounceRef.current);
                    numeroDebounceRef.current = setTimeout(
                      () => void geocodeWithNumero(e.target.value),
                      600,
                    );
                  }}
                />
              )}
            </>
          )}

          {step === 1 && (
            <StepMealTypes
              value={mealTypes}
              onChange={(v) => setValue('mealTypes', v as MealType[])}
              error={(errors.mealTypes as { message?: string } | undefined)?.message}
            />
          )}

          {step === 2 && (
            <StepEstablishment
              value={watch('establishmentType')}
              onChange={(v) => setValue('establishmentType', v)}
              error={errors.establishmentType?.message}
            />
          )}

          {step === 3 && (
            <StepCuisine
              value={cuisineTypes}
              onChange={(v) => setValue('cuisineTypes', v as CuisineType[])}
              error={(errors.cuisineTypes as { message?: string } | undefined)?.message}
            />
          )}

          {step === 4 && (
            <StepPrice
              value={watch('priceBucket')}
              onChange={(v) => setValue('priceBucket', v as PriceBucket)}
            />
          )}

          {step === 5 && (
            <StepPhoto
              photoFile={photoFile}
              onPhotoChange={setPhotoFile}
              submitted={submitted}
              onViewMyPlaces={() => router.push('/profile')}
            />
          )}

          {submitError && <p className="text-sm text-error">{submitError}</p>}
        </form>
      </PageContent>

      {!submitted && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-bg px-(--spacing-page-x) py-4">
          <div className="mx-auto max-w-lg">
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                className="w-full"
                onClick={async () => {
                  const fields = STEP_FIELDS[step];
                  const valid = fields.length === 0 || (await trigger(fields));
                  if (valid) setStep(step + 1);
                }}
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                form="add-place-form"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar lugar'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
