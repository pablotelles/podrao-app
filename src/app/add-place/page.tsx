'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPlaceSchema, type CreatePlaceInput } from '@/presentation/lib/schemas/placeSchema';
import { useGeolocation } from '@/presentation/hooks/useGeolocation';
import { useAddPlace } from '@/presentation/hooks/useAddPlace';
import { Button, Input, Badge } from '@/presentation/components/ui';
import { MEAL_TYPES } from '@/domain/value-objects/MealType';
import { CUISINE_TYPES } from '@/domain/value-objects/CuisineType';
import { PRICE_BUCKETS, PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';

// Mapa de nome completo do estado (retornado pelo LocationIQ) para sigla
const ESTADO_SIGLAS: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
  'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
  'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
  'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE',
  'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR',
  'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE',
  'Tocantins': 'TO',
};

function toEstadoSigla(state: string): string {
  if (state.length === 2) return state.toUpperCase();
  return ESTADO_SIGLAS[state] ?? state.slice(0, 2).toUpperCase();
}

const STEPS = ['Localização', 'Refeições', 'Estabelecimento', 'Cozinha', 'Preço', 'Foto'] as const;
const ESTABLISHMENT_TYPES = ['Restaurante', 'Padaria', 'Lanchonete', 'Cafeteria', 'Food truck', 'Mercado', 'Outro'] as const;

export default function AddPlacePage() {
  const router = useRouter();
  const geo = useGeolocation();
  const { submit, uploadPhoto, loading, error: submitError } = useAddPlace();
  const [step, setStep] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreatePlaceInput>({
    resolver: zodResolver(createPlaceSchema),
    defaultValues: { cuisineTypes: [], mealTypes: [] },
  });

  const mealTypes = watch('mealTypes') ?? [];
  const cuisineTypes = watch('cuisineTypes') ?? [];

  function toggleArray<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

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

    console.log('[add-place] GPS capturado:', { lat: geo.lat, lng: geo.lng });
    setValue('lat', geo.lat);
    setValue('lng', geo.lng);

    setGeocoding(true);
    fetch(`/api/geocode/reverse?lat=${geo.lat}&lng=${geo.lng}`)
      .then((r) => r.json())
      .then((data) => {
        console.log('[add-place] Endereço retornado:', data);
        if (data.address) {
          if (data.address.road) setValue('address', data.address.road);
          if (data.address.city) setValue('cidade', data.address.city);
          if (data.address.state) setValue('estado', toEstadoSigla(data.address.state));
          if (data.address.neighbourhood) setValue('bairro', data.address.neighbourhood);
        }
      })
      .catch((e) => console.error('[add-place] Erro no reverse geocoding:', e))
      .finally(() => setGeocoding(false));
  }, [geo.lat, geo.lng, setValue]);

  return (
    <main className="mx-auto max-w-lg px-(--spacing-page-x) pb-24 pt-6">
      {/* Progress */}
      <div className="mb-8 flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={['h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-brand' : 'bg-border'].join(' ')}
          />
        ))}
      </div>

      <h1 className="mb-1 text-xl font-bold text-text-primary">{STEPS[step]}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        {step === 0 && (
          <>
            <Button type="button" onClick={geo.request} disabled={geo.loading || geocoding} variant="secondary">
              {geo.loading ? 'Buscando GPS...' : geocoding ? 'Preenchendo endereço...' : '📍 Usar minha localização'}
            </Button>
            {geo.lat && geo.lng && !geocoding && (
              <p className="text-xs text-text-secondary">
                ✓ Localização capturada ({geo.lat.toFixed(5)}, {geo.lng.toFixed(5)})
              </p>
            )}
            {geo.error && <p className="text-xs text-error">{geo.error}</p>}
            <Input label="Endereço" error={errors.address?.message} {...register('address')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Número (opcional)" {...register('numero')} />
              <Input label="Complemento (opcional)" {...register('complemento')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cidade" error={errors.cidade?.message} {...register('cidade')} />
              <Input label="Estado (sigla)" maxLength={2} error={errors.estado?.message} {...register('estado')} />
            </div>
            <Input label="Bairro (opcional)" {...register('bairro')} />
          </>
        )}

        {step === 1 && (
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setValue('mealTypes', toggleArray(mealTypes, m))}
                className={['rounded-full border px-4 py-2 text-sm transition-colors',
                  mealTypes.includes(m) ? 'border-brand bg-brand-subtle text-brand' : 'border-border text-text-secondary',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
            {errors.mealTypes && <p className="w-full text-xs text-error">{errors.mealTypes.message}</p>}
          </div>
        )}

        {step === 2 && (
          <>
            <Input label="Nome do lugar" error={errors.name?.message} {...register('name')} />
            <div className="flex flex-wrap gap-2">
              {ESTABLISHMENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('establishmentType', t)}
                  className={['rounded-full border px-4 py-2 text-sm transition-colors',
                    watch('establishmentType') === t ? 'border-brand bg-brand-subtle text-brand' : 'border-border text-text-secondary',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-2">
            {CUISINE_TYPES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('cuisineTypes', toggleArray(cuisineTypes, c))}
                className={['rounded-full border px-4 py-2 text-sm transition-colors',
                  cuisineTypes.includes(c) ? 'border-brand bg-brand-subtle text-brand' : 'border-border text-text-secondary',
                ].join(' ')}
              >
                {c}
              </button>
            ))}
            {errors.cuisineTypes && <p className="w-full text-xs text-error">{errors.cuisineTypes.message}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-wrap gap-2">
            {PRICE_BUCKETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setValue('priceBucket', p)}
                className={['rounded-full border px-4 py-2 text-sm transition-colors',
                  watch('priceBucket') === p ? 'border-brand bg-brand-subtle text-brand' : 'border-border text-text-secondary',
                ].join(' ')}
              >
                {PRICE_BUCKET_LABELS[p]}
              </button>
            ))}
          </div>
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
              <Badge variant="brand" className="mt-2">{photoFile.name}</Badge>
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
            <Button type="button" className="flex-1" onClick={() => setStep(step + 1)}>
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
