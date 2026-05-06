import Image from 'next/image';
import { Check, Plus } from 'lucide-react';
import type { Place } from '@/domain/entities/Place';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';

interface AddPlaceResultRowProps {
  place: Place;
  added: boolean;
  loading: boolean;
  onAdd: () => void;
}

export function AddPlaceResultRow({ place, added, loading, onAdd }: AddPlaceResultRowProps) {
  const meta = [PRICE_BUCKET_LABELS[place.priceBucket], place.mealTypes[0], place.bairro]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Thumbnail */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bg-subtle">
        {place.logoUrl ? (
          <Image src={place.logoUrl} alt={place.name} fill className="object-cover" sizes="56px" />
        ) : (
          <div className="h-full w-full bg-bg-subtle" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-sm text-text-primary leading-tight">
          {place.name}
        </p>
        {place.establishmentType && (
          <p className="mt-0.5 truncate text-xs text-text-secondary">{place.establishmentType}</p>
        )}
        {meta && <p className="mt-0.5 truncate text-xs text-text-secondary">{meta}</p>}
      </div>

      {/* Botão +/✓ */}
      <button
        onClick={onAdd}
        disabled={added || loading}
        aria-label={added ? 'Já adicionado' : 'Adicionar à lista'}
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          added
            ? 'border-brand bg-brand text-white'
            : 'border-brand bg-transparent text-brand hover:bg-brand/10',
          loading ? 'opacity-50' : '',
        ].join(' ')}
      >
        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </div>
  );
}
