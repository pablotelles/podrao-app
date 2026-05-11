'use client';

import { useId, type TextareaHTMLAttributes } from 'react';
import { PhotoUpload } from '@/presentation/components/ui';
import {
  PRICE_BUCKETS,
  PRICE_BUCKET_LABELS,
  PRICE_BUCKET_SYMBOL,
} from '@/domain/value-objects/PriceBucket';
import type { PriceBucket } from '@/domain/value-objects/PriceBucket';
import type { EstablishmentType } from '@/domain/value-objects/EstablishmentType';
import { BadgeOpcional, FieldGroup } from './shared';

const PRICE_UNIT_LABEL: Record<EstablishmentType, string> = {
  restaurante: 'por pessoa',
  bar: 'por rodada',
  padaria: 'por item',
};

const DESCRIPTION_PLACEHOLDER: Record<EstablishmentType, string> = {
  restaurante:
    'Ex: O quilo é caprichado, proteína farta e arroz bem temperado. Fila anda rápido na hora do almoço.',
  bar: 'Ex: Chopp gelado, petisco generoso e preço justo. Ótimo pra ir depois do trabalho.',
  padaria: 'Ex: O pão de queijo sai quentinho toda manhã e o café é dos bons.',
};

/* ── Props ──────────────────────────────────────────────────────── */

interface StepEnrichmentProps {
  establishmentType: EstablishmentType;
  priceBucket?: PriceBucket;
  onPriceBucketChange: (v: PriceBucket) => void;
  descriptionRegisterProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
  descriptionError?: string;
  photoFile: File | null;
  onPhotoChange: (f: File | null) => void;
}

export function StepEnrichment({
  establishmentType,
  priceBucket,
  onPriceBucketChange,
  descriptionRegisterProps,
  descriptionError,
  photoFile,
  onPhotoChange,
}: StepEnrichmentProps) {
  const unitLabel = PRICE_UNIT_LABEL[establishmentType];
  const placeholder = DESCRIPTION_PLACEHOLDER[establishmentType];
  const textareaId = useId();

  const descValue =
    typeof descriptionRegisterProps?.value === 'string' ? descriptionRegisterProps.value : '';

  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div>
        <h1 className="text-[18px] font-bold leading-snug tracking-tight text-text-primary">
          Quase lá!
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Esses dados fazem muita diferença pra quem vai escolher.
        </p>
      </div>

      {/* Faixa de preço — grid 2×2 */}
      <FieldGroup label="Faixa de preço" hint={unitLabel}>
        <div className="grid grid-cols-2 gap-2">
          {PRICE_BUCKETS.map((bucket) => (
            <button
              key={bucket}
              type="button"
              onClick={() => onPriceBucketChange(bucket)}
              className={[
                'rounded-md border-[1.5px] px-2.5 py-3 text-center transition-all',
                priceBucket === bucket
                  ? 'border-brand bg-brand-subtle'
                  : 'border-border bg-bg hover:border-brand',
              ].join(' ')}
            >
              <p
                className={[
                  'text-[13px] font-bold',
                  priceBucket === bucket ? 'text-brand' : 'text-text-primary',
                ].join(' ')}
              >
                {PRICE_BUCKET_LABELS[bucket]}
              </p>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                {PRICE_BUCKET_SYMBOL[bucket]}
              </p>
            </button>
          ))}
        </div>
      </FieldGroup>

      {/* Descrição
          Mantém <textarea> nativo (não usa ui/Textarea) porque o contador de caracteres
          em tempo real depende de `descValue.length`, que é lido de descriptionRegisterProps.value.
          ui/Textarea não expõe ref nem valor controlado de forma compatível com esse padrão
          sem adicionar um ref extra ou reformular a API do componente.
      */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-[13px] font-semibold text-text-primary">
          O que você gosta nesse lugar?
          <BadgeOpcional />
        </label>
        <textarea
          id={textareaId}
          maxLength={1500}
          rows={4}
          placeholder={placeholder}
          className={[
            'w-full rounded-md border-[1.5px] border-border bg-bg px-4 py-3',
            'font-sans text-[15px] leading-relaxed text-text-primary',
            'placeholder:text-text-disabled',
            'focus:border-brand focus:outline-none',
            'resize-none transition-colors',
            descriptionError ? 'border-error' : '',
          ].join(' ')}
          {...descriptionRegisterProps}
        />
        <p className="text-right text-[11px] text-text-secondary">{descValue.length} / 1500</p>
        {descriptionError && <p className="text-xs text-error">{descriptionError}</p>}
      </div>

      {/* Foto */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-text-primary">
          Foto do lugar
          <BadgeOpcional />
        </label>
        <PhotoUpload value={photoFile} onChange={onPhotoChange} />
        <p className="text-xs text-text-secondary">Lugares com foto recebem 3× mais visitas. 📸</p>
      </div>
    </div>
  );
}
