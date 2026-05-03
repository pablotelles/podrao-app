import type { Review } from '@/domain/entities/Review';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <p className="py-4 text-sm text-[var(--color-text-secondary)]">
        Nenhuma avaliação ainda. Seja o primeiro!
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{r.thumbsUp ? '👍' : '👎'}</span>
            {r.mealType && (
              <span className="text-xs text-[var(--color-text-secondary)]">{r.mealType}</span>
            )}
            {r.amountPaid !== undefined && (
              <span className="ml-auto text-xs font-medium text-[var(--color-text-primary)]">
                R$ {r.amountPaid.toFixed(2)}
              </span>
            )}
          </div>
          {r.comment && (
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">{r.comment}</p>
          )}
          <p className="mt-1 text-xs text-[var(--color-text-disabled)]">
            {new Date(r.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </li>
      ))}
    </ul>
  );
}
