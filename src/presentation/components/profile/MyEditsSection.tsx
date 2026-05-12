'use client';

import Link from 'next/link';
import { Skeleton } from '@/presentation/components/ui';
import { useMyEdits } from '@/presentation/hooks/useMyEdits';
import { SectionShell } from './SectionShell';
import { EDIT_FIELD_LABELS } from '@/presentation/lib/editFieldLabels';
import { formatEditValue } from '@/presentation/lib/editFieldFormatters';
import type { PlaceEditWithPlace } from '@/domain/entities/PlaceEdit';

type PlaceEditStatus = PlaceEditWithPlace['status'];

function StatusBadge({ status }: { status: PlaceEditStatus }) {
  const map: Record<PlaceEditStatus, { label: string; bg: string; color: string; border: string }> =
    {
      pending: {
        label: 'Em verificação',
        bg: 'var(--color-verify-bg)',
        color: 'var(--color-verify-text)',
        border: 'var(--color-verify-border)',
      },
      approved: {
        label: 'Aprovada',
        bg: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        border: 'var(--color-success)',
      },
      rejected: {
        label: 'Não aprovada',
        bg: 'var(--color-error-bg)',
        color: 'var(--color-error)',
        border: 'var(--color-error)',
      },
      expired: {
        label: 'Encaminhada ao admin',
        bg: 'var(--color-bg-subtle)',
        color: 'var(--color-text-secondary)',
        border: 'var(--color-border)',
      },
    };

  const { label, bg, color, border } = map[status];

  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 shrink-0"
      style={{
        fontSize: 'var(--font-size-caption)',
        fontWeight: 'var(--font-weight-semibold)',
        backgroundColor: bg,
        color,
        borderColor: border,
      }}
    >
      {label}
    </span>
  );
}

function EditItem({ edit }: { edit: PlaceEditWithPlace }) {
  const placeHref = edit.placeSlug ? `/p/${edit.placeSlug}` : `/places/${edit.placeId}`;
  const fieldLabel = EDIT_FIELD_LABELS[edit.fieldName] ?? edit.fieldName;
  const formattedValue = formatEditValue(edit.fieldName, edit.newValue);

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={placeHref}
            className="block truncate font-semibold hover:underline"
            style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)' }}
          >
            {edit.placeName}
          </Link>
          <p
            className="mt-0.5 truncate"
            style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
          >
            {fieldLabel}: {formattedValue}
          </p>
          {edit.status === 'pending' && (
            <p
              className="mt-1"
              style={{
                fontSize: 'var(--font-size-caption)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span
                style={{ color: 'var(--color-success)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {edit.confirmCount} confirmaram
              </span>
              {' · '}
              <span
                style={{ color: 'var(--color-warning)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {edit.contestCount} contestaram
              </span>
            </p>
          )}
        </div>
        <StatusBadge status={edit.status} />
      </div>
    </div>
  );
}

export function MyEditsSection() {
  const { edits, isLoading } = useMyEdits();

  if (!isLoading && edits.length === 0) return null;

  return (
    <SectionShell title="Minhas sugestões">
      {isLoading ? (
        <div className="flex flex-col gap-3 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 border-b border-border">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="pb-2">
          {edits.map((edit) => (
            <EditItem key={edit.id} edit={edit} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
