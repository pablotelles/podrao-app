'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { createPlaceSchema, type CreatePlaceInput } from '@/presentation/lib/forms/place/schema';
import { createPlaceInitialValues } from '@/presentation/lib/forms/place/initialValues';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useAddPlace } from '@/presentation/hooks/useAddPlace';
import { Button, Input, Select, Badge, ProgressSteps, ToggleGroup } from '@/presentation/components/ui';
import { MEAL_TYPES } from '@/domain/value-objects/MealType';
import { CUISINE_TYPES } from '@/domain/value-objects/CuisineType';
import { PRICE_BUCKETS, PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';

const LocationPickerMap = dynamic(
  () => import('@/presentation/components/maps/LocationPickerMap'),
  { ssr: false, loading: () => <div className="h-[220px] w-full animate-pulse rounded-md bg-bg-subtle" /> },
);

// Mapa de nome completo do estado (retornado pelo LocationIQ) para sigla
const ESTADO_SIGLAS: Record<string, string> = {
  // (used for reverse-geocoding only)
  // ← intentional: keeps all 27 entries below
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

// Options for the Select — value = sigla, label = full name
const ESTADOS_OPTIONS = Object.entries(ESTADO_SIGLAS).map(([label, value]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, 'pt'));

// Which form fields must be valid before advancing each step
const STEP_FIELDS: (keyof CreatePlaceInput)[][] = [
  ['address', 'numero', 'cidade', 'estado', 'lat', 'lng'], // step 0
  ['mealTypes'],                                  // step 1
  ['name', 'establishmentType'],                  // step 2
  ['cuisineTypes'],                               // step 3
  ['priceBucket'],                               // step 4
  [],                                             // step 5 (foto opcional)
];

const STEPS = ['Localização', 'Refeições', 'Estabelecimento', 'Cozinha', 'Preço', 'Foto'] as const;
const ESTABLISHMENT_TYPES = [
  'Restaurante',
  'Padaria',
  'Lanchonete',
  'Cafeteria',
  'Food truck',
  'Mercado',
  'Outro',
] as const;

export default function AddPlacePage() {
  const router = useRouter();
  const geo = useGeolocation();
  const { submit, uploadPhoto, loading, error: submitError } = useAddPlace();
  const [step, setStep] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [geocoding, setGeocoding] = useState(false);

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
  const hasLocation = typeof formLat === 'number' && typeof formLng === 'number';

  // Faz reverse geocoding e preenche todos os campos de endereço
  const applyReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setGeocoding(true);
      try {
        const r = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
        const data = (await r.json()) as { address?: Record<string, string> };
        if (data.address) {
          if (data.address.road)
            setValue('address', data.address.road, { shouldValidate: true });
          if (data.address.house_number)
            setValue('numero', data.address.house_number, { shouldValidate: true });
          if (data.address.city)
            setValue('cidade', data.address.city, { shouldValidate: true });
          if (data.address.state)
            setValue('estado', toEstadoSigla(data.address.state), { shouldValidate: true });
          if (data.address.neighbourhood)
            setValue('bairro', data.address.neighbourhood);
        }
      } catch (e) {
        console.error('[add-place] Erro no reverse geocoding:', e);
      } finally {
        setGeocoding(false);
      }
    },
    [setValue],
  );

  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      setValue('lat', lat, { shouldValidate: true });
      setValue('lng', lng, { shouldValidate: true });
      void applyReverseGeocode(lat, lng);
    },
    [setValue, applyReverseGeocode],
  );

  async function onSubmit(data: CreatePlaceInput) {
    let photoUrl: string | undefined;
    if (photoFile) {
      const url = await uploadPhoto(photoFile);
      if (url) photoUrl = url;
    }
    const place = await submit({ ...data, photoUrl });
    if (place) router.push(`/places/${place.id}`);
  }

  // Quando o GPS responder, seta lat/lng e faz reverse geocoding para preencher endereço
  useEffect(() => {
    if (!geo.lat || !geo.lng) return;
    setValue('lat', geo.lat, { shouldValidate: true });
    setValue('lng', geo.lng, { shouldValidate: true });
    void applyReverseGeocode(geo.lat, geo.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.lat, geo.lng]);

  return (
    <main className="mx-auto max-w-lg px-(--spacing-page-x) pb-24 pt-6">
      {/* Progress */}
      <div className="mb-8">
        <ProgressSteps currentStep={step} totalSteps={STEPS.length} labels={STEPS} />
      </div>

      <h1 className="mb-1 text-xl font-bold text-text-primary">{STEPS[step]}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        {step === 0 && (
          <>
            <Button
              type="button"
              onClick={geo.request}
              disabled={geo.loading || geocoding}
              variant="secondary"
            >
              {geo.loading
                ? 'Buscando GPS...'
                : geocoding
                  ? 'Preenchendo endereço...'
                  : '📍 Usar minha localização'}
            </Button>
            {geo.lat && geo.lng && !geocoding && (
              <p className="text-xs text-text-secondary">
                ✓ Localização capturada ({geo.lat.toFixed(5)}, {geo.lng.toFixed(5)})
              </p>
            )}
            {geo.error && <p className="text-xs text-error">{geo.error}</p>}

            {hasLocation && (
              <LocationPickerMap
                lat={formLat}
                lng={formLng}
                onLocationChange={handleLocationChange}
              />
            )}

            <Input label="Endereço" error={errors.address?.message} {...register('address')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Número" error={errors.numero?.message} {...register('numero')} />
              <Input label="Complemento (opcional)" {...register('complemento')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cidade" error={errors.cidade?.message} {...register('cidade')} />
              <Select
                label="Estado"
                placeholder="Selecione"
                options={ESTADOS_OPTIONS}
                error={errors.estado?.message}
                {...register('estado')}
              />
            </div>
            <Input label="Bairro (opcional)" {...register('bairro')} />
          </>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-2">
            <ToggleGroup
              mode="multi"
              options={MEAL_TYPES}
              value={mealTypes}
              onChange={(v) => setValue('mealTypes', v)}
            />
            {errors.mealTypes && <p className="text-xs text-error">{errors.mealTypes.message}</p>}
          </div>
        )}

        {step === 2 && (
          <>
            <Input label="Nome do lugar" error={errors.name?.message} {...register('name')} />
            <ToggleGroup
              mode="single"
              options={ESTABLISHMENT_TYPES}
              value={watch('establishmentType')}
              onChange={(v) => v && setValue('establishmentType', v)}
            />
          </>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-2">
            <ToggleGroup
              mode="multi"
              options={CUISINE_TYPES}
              value={cuisineTypes}
              onChange={(v) => setValue('cuisineTypes', v)}
            />
            {errors.cuisineTypes && <p className="text-xs text-error">{errors.cuisineTypes.message}</p>}
          </div>
        )}

        {step === 4 && (
          <ToggleGroup
            mode="single"
            options={PRICE_BUCKETS}
            value={watch('priceBucket')}
            onChange={(v) => v && setValue('priceBucket', v)}
            renderLabel={(p) => PRICE_BUCKET_LABELS[p]}
          />
        )}

        {step === 5 && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Foto do lugar (opcional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="text-sm text-text-secondary"
            />
            {photoFile && (
              <Badge variant="brand" className="mt-2">
                {photoFile.name}
              </Badge>
            )}
          </div>
        )}

        {submitError && <p className="text-sm text-error">{submitError}</p>}

        <div className="mt-4 flex gap-3">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              className="flex-1"
              onClick={async () => {
                const fields = STEP_FIELDS[step];
                const valid = fields.length === 0 || await trigger(fields);
                if (valid) setStep(step + 1);
              }}
            >
              Próximo
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar lugar'}
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}
