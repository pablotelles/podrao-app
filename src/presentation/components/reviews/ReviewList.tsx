import type { Review } from '@/domain/entities/Review';
import { EmptyState } from '@/presentation/components/ui';
import { StarRating } from '@/presentation/components/ui/StarRating';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <EmptyState
        icon="💬"
        title="Nenhuma avaliação ainda"
        description="Seja o primeiro a avaliar este lugar!"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-md border border-border p-3">
          <div className="flex items-center gap-2">
            <StarRating value={r.rating} onChange={() => {}} readonly size="sm" />
            {r.mealType && <span className="text-xs text-text-secondary">{r.mealType}</span>}
            {r.amountPaidPerPerson !== undefined && (
              <span className="ml-auto text-xs font-medium text-text-primary">
                R$ {r.amountPaidPerPerson.toFixed(2)}/pessoa
              </span>
            )}
          </div>
          {r.comment && <p className="mt-1 text-sm text-text-primary">{r.comment}</p>}
          {r.photos && r.photos.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {r.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Foto ${idx + 1} da avaliação`}
                  className="h-20 w-20 rounded object-cover"
                />
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-text-disabled">
            {new Date(r.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </li>
      ))}
    </ul>
  );
}
