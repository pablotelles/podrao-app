import type { Place } from '@/domain/entities/Place';
import { PRICE_BUCKET_LABELS } from '@/domain/value-objects/PriceBucket';
import { Button, PlaceRating } from '@/presentation/components/ui';

interface PlaceMapPopupProps {
  place: Place;
  onViewMore: () => void;
  onClose: () => void;
}

export function PlaceMapPopup({ place, onViewMore, onClose }: PlaceMapPopupProps) {
  return (
    <div className="rounded-lg bg-bg p-4 shadow-modal">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-text-primary">{place.name}</p>
          {place.bairro && (
            <p className="mt-0.5 text-xs text-text-secondary">{place.bairro}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-brand">
              {PRICE_BUCKET_LABELS[place.priceBucket]}
            </span>
            <PlaceRating rating={place.rating} reviewsCount={place.reviewsCount} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xl leading-none text-text-secondary hover:text-text-primary"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>

      <Button className="mt-3 w-full" onClick={onViewMore}>
        Ver mais
      </Button>
    </div>
  );
}
