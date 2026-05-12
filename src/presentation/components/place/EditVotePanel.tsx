'use client';

import { Check, X, Pencil } from 'lucide-react';
import { mutate } from 'swr';
import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';
import { DiffView } from './DiffView';
import { VoteProgressBar } from './VoteProgressBar';
import { useVoteOnEdit } from '@/presentation/hooks/useVoteOnEdit';
import { EDIT_FIELD_LABELS } from '@/presentation/lib/editFieldLabels';

interface EditVotePanelProps {
  edit: PlaceEditWithVotes;
  placeId: string;
  placeName: string;
  placeAddress: string;
  currentUserId?: string;
}

function FieldIcon({ fieldName }: { fieldName: string }) {
  const icons: Record<string, string> = {
    name: '🏷️',
    location: '📍',
    price_bucket: '💰',
    description: '📝',
    payment_methods: '💳',
    periods: '🕐',
    cover_photo: '📷',
    service_type: '🍽️',
    food_tags: '🥘',
    bar_focus: '🍺',
    drink_tags: '🥂',
    has_happy_hour: '🎉',
    specialty_tags: '⭐',
    opens_early: '🌅',
  };
  return <span aria-hidden="true">{icons[fieldName] ?? '✏️'}</span>;
}

function VoteActions({
  editId,
  isProponent,
  hasVoted,
  viewerVote,
  status,
  isAuthenticated,
}: {
  editId: string;
  isProponent: boolean;
  hasVoted: boolean;
  viewerVote?: 'confirm' | 'contest' | null;
  status: string;
  isAuthenticated: boolean;
}) {
  const { submitVote, isLoading, error } = useVoteOnEdit(editId, () => {
    void mutate(`/api/edits/${editId}`);
  });

  if (status === 'approved') {
    return (
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 border-t"
        style={{
          backgroundColor: 'var(--color-success-bg)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-success)',
          fontSize: 'var(--font-size-label)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        <Check size={14} strokeWidth={2.5} />
        Sugestão aprovada pela comunidade
      </div>
    );
  }

  if (status === 'rejected' || status === 'expired') {
    return (
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 border-t"
        style={{
          backgroundColor:
            status === 'rejected' ? 'var(--color-error-bg)' : 'var(--color-bg-subtle)',
          borderColor: 'var(--color-border)',
          color: status === 'rejected' ? 'var(--color-error)' : 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-label)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        <X size={14} strokeWidth={2.5} />
        {status === 'rejected' ? 'Não aprovada — informação mantida' : 'Encaminhada ao admin'}
      </div>
    );
  }

  if (isProponent) {
    return (
      <div
        className="flex items-center gap-2 px-3.5 pb-3.5"
        style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <Pencil size={14} />
        Você propôs esta sugestão
      </div>
    );
  }

  if (hasVoted && viewerVote) {
    const isConfirm = viewerVote === 'confirm';
    return (
      <div
        className="flex items-center gap-2 px-3.5 pb-3.5"
        style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)' }}
      >
        <span>Você votou:</span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{
            backgroundColor: isConfirm ? 'var(--color-brand-subtle)' : 'var(--color-error-bg)',
            color: isConfirm ? 'var(--color-brand)' : 'var(--color-error)',
            border: `1px solid ${isConfirm ? 'var(--color-brand-border-subtle)' : 'var(--color-error-border-subtle)'}`,
            fontSize: 'var(--font-size-label)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          {isConfirm ? <Check size={12} strokeWidth={2.5} /> : <X size={12} strokeWidth={2.5} />}
          {isConfirm ? 'Confirmei' : 'Contestei'}
        </span>
      </div>
    );
  }

  if (error === 'EDIT_DUPLICATE_VOTE') {
    return (
      <div
        className="px-3.5 pb-3.5"
        style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)' }}
      >
        Você já votou nesta sugestão.
      </div>
    );
  }

  return (
    <div className="flex gap-2 px-3.5 pb-3.5">
      <button
        type="button"
        disabled={!isAuthenticated || isLoading}
        onClick={() => void submitVote('confirm')}
        title={!isAuthenticated ? 'Faça login para votar' : undefined}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45"
        style={{
          height: '44px',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-text-inverse)',
          fontSize: 'var(--font-size-label)',
          fontWeight: 'var(--font-weight-semibold)',
          boxShadow: 'var(--shadow-fab)',
        }}
      >
        <Check size={14} strokeWidth={2.5} />
        Confirmo — já vi isso também
      </button>
      <button
        type="button"
        disabled={!isAuthenticated || isLoading}
        onClick={() => void submitVote('contest')}
        title={!isAuthenticated ? 'Faça login para votar' : undefined}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-full transition-colors hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-45"
        style={{
          height: '44px',
          backgroundColor: 'transparent',
          color: 'var(--color-error)',
          border: '1.5px solid var(--color-error)',
          fontSize: 'var(--font-size-label)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        <X size={14} strokeWidth={2.5} />
        Contesto
      </button>
    </div>
  );
}

export function EditVotePanel({
  edit,
  placeName,
  placeAddress,
  currentUserId,
}: EditVotePanelProps) {
  const isProponent = !!currentUserId && edit.userId === currentUserId;
  const hasVoted = edit.viewerVote !== null && edit.viewerVote !== undefined;
  const isAuthenticated = !!currentUserId;
  const fieldLabel = EDIT_FIELD_LABELS[edit.fieldName] ?? edit.fieldName;
  const isPhotoField = edit.fieldName === 'cover_photo';

  return (
    <div className="flex flex-col gap-0">
      {/* Place context strip */}
      <div
        className="flex items-center gap-2.5 border-b px-4 py-2.5"
        style={{
          backgroundColor: 'var(--color-bg-subtle)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: 'var(--color-brand-subtle)' }}
        >
          🍽️
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-semibold"
            style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-primary)' }}
          >
            {placeName}
          </p>
          <p
            className="truncate"
            style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
          >
            {placeAddress}
          </p>
        </div>
        {edit.status === 'pending' && (
          <span
            className="shrink-0 rounded-full border px-2 py-0.5"
            style={{
              fontSize: 'var(--font-size-caption)',
              fontWeight: 'var(--font-weight-semibold)',
              backgroundColor: 'var(--color-verify-bg)',
              color: 'var(--color-verify-text)',
              borderColor: 'var(--color-verify-border)',
              whiteSpace: 'nowrap',
            }}
          >
            Em verificação
          </span>
        )}
      </div>

      {/* Edit card */}
      <div
        className="mx-4 my-3 overflow-hidden rounded-xl border"
        style={{ borderColor: 'var(--color-border)', borderWidth: '1.5px' }}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between border-b px-3.5 py-3"
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <FieldIcon fieldName={edit.fieldName} />
            <span
              className="font-semibold uppercase tracking-wide"
              style={{
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.04em',
              }}
            >
              {fieldLabel}
            </span>
          </div>
          {edit.level === 2 && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
              style={{
                fontSize: 'var(--font-size-caption)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
              }}
            >
              🛡️ Requer mais votos
            </span>
          )}
        </div>

        {/* Diff */}
        <div className="px-3.5 py-3">
          <DiffView
            fieldName={edit.fieldName}
            currentValue={edit.oldValue}
            proposedValue={edit.newValue}
            isPhotoField={isPhotoField}
          />
        </div>

        {/* Proponent note */}
        {edit.note && (
          <div
            className="mx-3.5 mb-3 rounded-lg border px-3 py-2"
            style={{
              backgroundColor: 'var(--color-warning-bg)',
              borderColor: 'var(--color-warning-border)',
            }}
          >
            <p
              className="mb-0.5 font-semibold uppercase tracking-wide"
              style={{
                fontSize: 'var(--font-size-caption)',
                color: 'var(--color-warning-text)',
                letterSpacing: '0.04em',
              }}
            >
              Nota
            </p>
            <p
              style={{
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-warning-text)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {edit.note}
            </p>
          </div>
        )}

        {/* Vote progress */}
        <div className="px-3.5 pb-3">
          <VoteProgressBar confirmCount={edit.confirmCount} contestCount={edit.contestCount} />
        </div>

        {/* Vote actions */}
        <VoteActions
          editId={edit.id}
          isProponent={isProponent}
          hasVoted={hasVoted}
          viewerVote={edit.viewerVote}
          status={edit.status}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
