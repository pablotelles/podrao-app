import type { Review } from '@/domain/entities/Review';
import { EmptyState } from '@/presentation/components/ui';

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
            <span className="text-lg" aria-label={r.thumbsUp ? 'Recomendado' : 'Não recomendado'}>
              {r.thumbsUp ? '👍' : '👎'}
            </span>
            {r.mealType && (
              <span className="text-xs text-text-secondary">{r.mealType}</span>
            )}
            {r.amountPaid !== undefined && (
              <span className="ml-auto text-xs font-medium text-text-primary">
                R$ {r.amountPaid.toFixed(2)}
              </span>
            )}
          </div>
          {r.comment && (
            <p className="mt-1 text-sm text-text-primary">{r.comment}</p>
          )}
          <p className="mt-1 text-xs text-text-disabled">
            {new Date(r.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </li>
      ))}
    </ul>
  );
}

