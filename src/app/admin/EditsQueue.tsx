'use client';

import { Check, X } from 'lucide-react';
import { Button, EmptyState, Skeleton } from '@/presentation/components/ui';
import { DiffView } from '@/presentation/components/place/DiffView';
import { useAdminEditsQueue } from '@/presentation/hooks/useAdminEditsQueue';
import { useToast } from '@/presentation/hooks/useToast';
import { EDIT_FIELD_LABELS } from '@/presentation/lib/editFieldLabels';
import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';
import { useState } from 'react';

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function EditQueueItem({ edit, onResolved }: { edit: PlaceEditWithVotes; onResolved: () => void }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { showToast } = useToast();
  const fieldLabel = EDIT_FIELD_LABELS[edit.fieldName] ?? edit.fieldName;
  const isPhotoField = edit.fieldName === 'cover_photo';

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/admin/edits/${edit.id}/approve`, { method: 'POST' });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Erro ao aprovar');
      }
      showToast({ type: 'success', title: 'Sugestão aprovada' });
      onResolved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao aprovar';
      showToast({ type: 'error', title: msg });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/admin/edits/${edit.id}/reject`, { method: 'POST' });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Erro ao rejeitar');
      }
      showToast({ type: 'success', title: 'Sugestão rejeitada' });
      onResolved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao rejeitar';
      showToast({ type: 'error', title: msg });
    } finally {
      setIsRejecting(false);
    }
  };

  const isBusy = isApproving || isRejecting;

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
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
          {edit.level === 2 && (
            <span
              className="inline-flex items-center rounded-full border px-2 py-0.5 shrink-0"
              style={{
                fontSize: 'var(--font-size-caption)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-subtle)',
                borderColor: 'var(--color-border)',
              }}
            >
              🛡️ Nível 2
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-secondary)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {formatDate(edit.createdAt)}
        </span>
      </div>

      {/* Diff */}
      <div className="mb-3">
        <DiffView
          fieldName={edit.fieldName}
          currentValue={edit.oldValue}
          proposedValue={edit.newValue}
          isPhotoField={isPhotoField}
        />
      </div>

      {/* Note */}
      {edit.note && (
        <div
          className="mb-3 rounded-lg border px-3 py-2"
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
            Nota do proponente
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

      {/* Votes summary */}
      <p
        className="mb-3"
        style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
      >
        <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-weight-medium)' }}>
          {edit.confirmCount} confirmaram
        </span>
        {' · '}
        <span style={{ color: 'var(--color-warning)', fontWeight: 'var(--font-weight-medium)' }}>
          {edit.contestCount} contestaram
        </span>
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          isLoading={isApproving}
          disabled={isBusy}
          onClick={() => void handleApprove()}
          className="flex items-center gap-1.5"
        >
          <Check size={14} />
          Aprovar
        </Button>
        <Button
          variant="danger"
          size="sm"
          isLoading={isRejecting}
          disabled={isBusy}
          onClick={() => void handleReject()}
          className="flex items-center gap-1.5"
        >
          <X size={14} />
          Rejeitar
        </Button>
      </div>
    </div>
  );
}

function QueueSection({
  title,
  edits,
  isLoading,
  onResolved,
}: {
  title: string;
  edits: PlaceEditWithVotes[];
  isLoading: boolean;
  onResolved: () => void;
}) {
  return (
    <div>
      <h3
        className="mb-4 font-semibold"
        style={{ fontSize: 'var(--font-size-subheading)', color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : edits.length === 0 ? (
        <EmptyState title="Nenhuma sugestão aqui" description="Tudo em dia por aqui." icon="✓" />
      ) : (
        <div className="flex flex-col gap-3">
          {edits.map((edit) => (
            <EditQueueItem key={edit.id} edit={edit} onResolved={onResolved} />
          ))}
        </div>
      )}
    </div>
  );
}

export function EditsQueue() {
  const { expiredEdits, level2Edits, isLoading, refresh } = useAdminEditsQueue();

  return (
    <div className="mt-8">
      <hr style={{ borderColor: 'var(--color-border)' }} className="mb-8" />
      <h2 className="mb-6 text-2xl font-bold text-text-primary">Fila de Sugestões</h2>
      <div className="flex flex-col gap-10">
        <QueueSection
          title="Expiradas — aguardando decisão admin"
          edits={expiredEdits}
          isLoading={isLoading}
          onResolved={() => void refresh()}
        />
        <QueueSection
          title="Nível 2 — pendentes de votação estendida"
          edits={level2Edits}
          isLoading={isLoading}
          onResolved={() => void refresh()}
        />
      </div>
    </div>
  );
}
