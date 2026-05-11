'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useZodForm } from '@/presentation/lib/forms/useZodForm';
import { createPlaceSchema, type CreatePlaceInput } from '@/presentation/lib/forms/place/schema';
import { createPlaceInitialValues } from '@/presentation/lib/forms/place/initialValues';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useAddPlace } from '@/presentation/hooks/useAddPlace';
import { PageContent } from '@/presentation/components/ui';
import { usePageTitle } from '@/presentation/contexts/TopBarContext';
import { StepBasic } from '@/presentation/components/add-place/StepBasic';
import { StepDetails } from '@/presentation/components/add-place/StepDetails';
import { StepEnrichment } from '@/presentation/components/add-place/StepEnrichment';
import { ESTABLISHMENT_TYPE_META } from '@/domain/value-objects/EstablishmentType';
import type { EstablishmentType } from '@/domain/value-objects/EstablishmentType';
import type { OperatingPeriod } from '@/domain/value-objects/OperatingPeriod';
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

const STEP_LABELS = ['Básico', 'Detalhes', 'Enriquecimento'] as const;
const TOTAL_STEPS = STEP_LABELS.length;

const STEP_FIELDS: (keyof CreatePlaceInput)[][] = [
  ['name', 'lat', 'lng', 'numero', 'address', 'cidade', 'estado', 'establishmentType'],
  ['periods'],
  ['priceBucket'],
];

interface SubmittedPlace {
  name: string;
  address: string;
  establishmentType: EstablishmentType;
}

export default function AddPlacePage() {
  const router = useRouter();
  const geo = useGeolocation();
  const { submit, uploadPhoto, loading, error: submitError } = useAddPlace();
  const [step, setStep] = useState(0);
  usePageTitle(STEP_LABELS[step]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedPlace, setSubmittedPlace] = useState<SubmittedPlace | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AutocompleteResult | null>(null);
  const isSubmittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useZodForm<CreatePlaceInput>({
    schema: createPlaceSchema,
    defaultValues: createPlaceInitialValues,
  });

  const formLat = watch('lat');
  const formLng = watch('lng');
  const establishmentType = watch('establishmentType') as EstablishmentType | undefined;
  const periods = (watch('periods') ?? []) as OperatingPeriod[];
  const attributes = watch('attributes') ?? {};
  const priceBucket = watch('priceBucket') as PriceBucket | undefined;
  const formName = watch('name') ?? '';
  const formAddress = watch('address') ?? '';
  const formCidade = watch('cidade') ?? '';
  const formEstado = watch('estado') ?? '';

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
    [setValue],
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
    [setValue],
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

  function handleAttributeChange(key: string, value: string[]) {
    setValue('attributes', { ...attributes, [key]: value });
  }

  async function onSubmit(data: CreatePlaceInput) {
    if (submitted || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        const url = await uploadPhoto(photoFile);
        if (url) photoUrl = url;
      }
      const place = await submit({ ...data, photoUrl });
      if (place) {
        setSubmittedPlace({
          name: formName,
          address: [formAddress, formCidade, formEstado].filter(Boolean).join(', '),
          establishmentType: data.establishmentType as EstablishmentType,
        });
        setSubmitted(true);
      }
    } finally {
      isSubmittingRef.current = false;
    }
  }

  async function handleNext() {
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 || (await trigger(fields));
    if (valid) setStep((s) => s + 1);
  }

  function handleReset() {
    reset(createPlaceInitialValues);
    setSelectedAddress(null);
    setPhotoFile(null);
    setSubmitted(false);
    setSubmittedPlace(null);
    setStep(0);
  }

  /* ── Success screen ─────────────────────────────────────────────── */
  if (submitted && submittedPlace) {
    const meta = ESTABLISHMENT_TYPE_META[submittedPlace.establishmentType];
    return (
      <div className="flex flex-col">
        {/* Success content */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          {/* Check icon */}
          <div
            className="flex h-18 w-18 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-success-bg)' }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="2.5"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-[22px] font-bold tracking-tight text-text-primary">Mandou bem! 🎉</h1>
          <p className="max-w-70 text-sm leading-relaxed text-text-secondary">
            O lugar vai aparecer no mapa assim que um moderador confirmar. Costuma levar menos de
            24h.
          </p>

          {/* Place card */}
          <div className="flex w-full items-center gap-3 rounded-md bg-bg-subtle px-4 py-3.5 text-left">
            <span className="text-[32px] leading-none">{meta.icon}</span>
            <div>
              <p className="text-[15px] font-semibold text-text-primary">{submittedPlace.name}</p>
              <p className="mt-0.5 text-[13px] text-text-secondary">{submittedPlace.address}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full rounded-full bg-brand py-3.75 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Ver no mapa
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-full border border-border py-3.25 text-[14px] font-medium text-text-secondary transition-all hover:border-brand hover:text-brand"
            >
              Cadastrar outro lugar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Progress bar ───────────────────────────────────────────────── */
  const progressBar = (
    <div className="px-5 pt-4">
      <div className="flex gap-1.5">
        <div
          className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-brand' : 'bg-brand opacity-50'}`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-brand' : step === 1 ? 'bg-brand opacity-50' : 'bg-border'}`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-all ${step === 2 ? 'bg-brand opacity-50' : 'bg-border'}`}
        />
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
        Passo {step + 1} de 3 — {STEP_LABELS[step]}
      </p>
    </div>
  );

  return (
    <div>
      {progressBar}

      <PageContent className="mx-auto w-full max-w-lg pb-28 pt-4">
        <form id="add-place-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {step === 0 && (
            <StepBasic
              nameError={errors.name?.message}
              nameRegisterProps={register('name')}
              establishmentType={establishmentType}
              onEstablishmentTypeChange={(v) =>
                setValue('establishmentType', v, { shouldValidate: true })
              }
              establishmentTypeError={errors.establishmentType?.message}
              selectedAddress={selectedAddress}
              onAddressSelect={handleAddressSelect}
              onAddressClear={() => setSelectedAddress(null)}
              onGpsClick={geo.request}
              geoLoading={geo.loading}
              geocoding={geocoding}
              geoError={geo.error ?? undefined}
              formLat={formLat}
              formLng={formLng}
              onLocationChange={handleLocationChange}
              locationError={errors.lat?.message ?? errors.lng?.message}
              numeroError={errors.numero?.message}
              numeroRegisterProps={register('numero')}
              onNumeroChange={(e) => {
                void register('numero').onChange(e);
                if (numeroDebounceRef.current) clearTimeout(numeroDebounceRef.current);
                numeroDebounceRef.current = setTimeout(
                  () => void geocodeWithNumero(e.target.value),
                  600,
                );
              }}
            />
          )}

          {step === 1 && establishmentType && (
            <StepDetails
              establishmentType={establishmentType}
              attributes={attributes}
              onAttributeChange={handleAttributeChange}
              periods={periods}
              onPeriodsChange={(v) => setValue('periods', v, { shouldValidate: true })}
              periodsError={(errors.periods as { message?: string } | undefined)?.message}
            />
          )}

          {step === 2 && establishmentType && (
            <StepEnrichment
              establishmentType={establishmentType}
              priceBucket={priceBucket}
              onPriceBucketChange={(v) => setValue('priceBucket', v, { shouldValidate: true })}
              descriptionRegisterProps={register('description')}
              descriptionError={errors.description?.message}
              photoFile={photoFile}
              onPhotoChange={setPhotoFile}
            />
          )}

          {submitError && <p className="text-sm text-error">{submitError}</p>}
        </form>
      </PageContent>

      {/* Bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-bg px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0))]"
        style={{ zIndex: 'var(--z-sticky)' }}
      >
        <div className="mx-auto flex max-w-lg flex-col gap-2.5">
          {/* Primary button */}
          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-full bg-brand py-3.75 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Continuar →
            </button>
          ) : (
            <button
              type="submit"
              form="add-place-form"
              disabled={loading || submitted}
              className="w-full rounded-full bg-brand py-3.75 text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar lugar ✓'}
            </button>
          )}

          {/* Back button */}
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="w-full rounded-full border border-border py-3.25 text-[14px] font-medium text-text-secondary transition-all hover:border-brand hover:text-brand"
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
