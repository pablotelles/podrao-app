'use client';

import { StarRating } from '@/presentation/components/ui';
import { REVIEW_CATEGORY_META } from '@/domain/value-objects/ReviewCategory';
import type { SubmitReviewInput } from '@/presentation/lib/forms/review/schema';

interface StepReviewProps {
  data: Partial<SubmitReviewInput>;
  placeName?: string;
}

export function StepReview({ data, placeName }: StepReviewProps) {
  return (
    <div className="py-4">
      <h2 className="mb-2 text-xl font-bold text-text-primary">Confira sua avaliação</h2>
      <p className="mb-6 text-sm text-text-secondary">Revise antes de publicar</p>

      {/* Lugar */}
      {placeName && (
        <div className="mb-4 rounded-lg bg-surface-secondary p-3">
          <p className="text-xs text-text-secondary">Avaliando</p>
          <p className="font-semibold text-text-primary">{placeName}</p>
        </div>
      )}

      {/* Nota geral */}
      <div className="mb-4">
        <p className="mb-1 text-sm font-medium text-text-primary">Sua nota geral</p>
        <StarRating value={data.rating ?? 0} onChange={() => {}} readonly size="md" />
      </div>

      {/* Scores por categoria */}
      {data.scores && data.scores.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-text-primary">Detalhes</p>
          <div className="flex flex-col gap-2">
            {data.scores.map((score) => {
              const meta = REVIEW_CATEGORY_META[score.category];
              return (
                <div key={score.category} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{meta.label}</span>
                  <StarRating value={score.score} onChange={() => {}} readonly size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comentário */}
      {data.comment && (
        <div className="mb-4">
          <p className="mb-1 text-sm font-medium text-text-primary">Seu comentário</p>
          <p className="text-sm text-text-secondary leading-relaxed">{data.comment}</p>
        </div>
      )}

      {/* Contexto da visita */}
      {(data.mealType || data.amountPaidPerPerson) && (
        <div className="mb-4 flex gap-3 text-xs text-text-secondary">
          {data.mealType && <span>🍽️ {data.mealType}</span>}
          {data.amountPaidPerPerson && (
            <span>💰 R$ {data.amountPaidPerPerson.toFixed(2)}/pessoa</span>
          )}
        </div>
      )}

      {/* Fotos */}
      {data.photoUrls && data.photoUrls.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-text-primary">
            {data.photoUrls.length} foto{data.photoUrls.length > 1 ? 's' : ''} adicionada
            {data.photoUrls.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {data.photoUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Foto ${idx + 1}`}
                className="aspect-square rounded object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
