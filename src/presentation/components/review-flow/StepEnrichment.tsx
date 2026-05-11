'use client';

import { useId } from 'react';
import { SubRatingList } from './SubRatingList';
import { PhotoUploadGrid } from './PhotoUploadGrid';
import type { ReviewScore } from '@/domain/entities/ReviewScore';

interface StepEnrichmentProps {
  scores: ReviewScore[];
  onScoresChange: (scores: ReviewScore[]) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  photoUrls: string[];
  onPhotoUrlsChange: (urls: string[]) => void;
}

const MAX_COMMENT = 1500;

export function StepEnrichment({
  scores,
  onScoresChange,
  comment,
  onCommentChange,
  photoUrls,
  onPhotoUrlsChange,
}: StepEnrichmentProps) {
  const textareaId = useId();

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Sub-ratings */}
      <div className="flex flex-col gap-3">
        <p className="text-[14px] font-semibold text-text-primary">
          Avalie em detalhes <span className="font-normal text-text-disabled">(opcional)</span>
        </p>
        <SubRatingList scores={scores} onChange={onScoresChange} />
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-[13px] font-semibold text-text-primary">
          Conte mais sobre sua experiência{' '}
          <span className="font-normal text-text-disabled">(opcional)</span>
        </label>
        <textarea
          id={textareaId}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          maxLength={MAX_COMMENT}
          rows={4}
          placeholder="O que mais te marcou? Como foi o atendimento? Valeu o preço?"
          className={[
            'w-full rounded-md border-[1.5px] border-border bg-bg px-4 py-3',
            'font-sans text-[15px] leading-relaxed text-text-primary',
            'placeholder:text-text-disabled',
            'focus:border-brand focus:outline-none',
            'resize-none transition-colors',
          ].join(' ')}
        />
        <p className="text-right text-[11px] text-text-secondary">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>

      {/* Photos */}
      <div className="flex flex-col gap-2">
        <p className="text-[14px] font-semibold text-text-primary">
          Adicione fotos <span className="font-normal text-text-disabled">(opcional)</span>
        </p>
        <PhotoUploadGrid photoUrls={photoUrls} onChange={onPhotoUrlsChange} />
      </div>
    </div>
  );
}
