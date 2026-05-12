import Image from 'next/image';
import { formatEditValue } from '@/presentation/lib/editFieldFormatters';

interface DiffViewProps {
  fieldName: string;
  currentValue: unknown;
  proposedValue: unknown;
  isPhotoField?: boolean;
}

export function DiffView({ fieldName, currentValue, proposedValue, isPhotoField }: DiffViewProps) {
  if (isPhotoField) {
    return (
      <div className="flex gap-3">
        <div className="flex-1">
          <p
            className="mb-1.5 font-medium"
            style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
          >
            Atual
          </p>
          <div className="relative h-32 overflow-hidden rounded-lg border border-border bg-bg-subtle">
            {currentValue ? (
              <Image src={String(currentValue)} alt="Foto atual" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--color-text-disabled)',
                  }}
                >
                  Sem foto
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p
            className="mb-1.5 font-medium"
            style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
          >
            Proposto
          </p>
          <div className="relative h-32 overflow-hidden rounded-lg border border-brand bg-brand-subtle">
            {proposedValue ? (
              <Image
                src={String(proposedValue)}
                alt="Foto proposta"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--color-text-disabled)',
                  }}
                >
                  Sem foto
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1 rounded-lg border border-border bg-bg p-3">
        <p
          className="mb-1 font-medium"
          style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
        >
          Atual
        </p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-primary)' }}>
          {formatEditValue(fieldName, currentValue)}
        </p>
      </div>
      <div className="flex-1 rounded-lg border border-brand bg-brand-subtle p-3">
        <p
          className="mb-1 font-medium"
          style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
        >
          Proposto
        </p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-primary)' }}>
          {formatEditValue(fieldName, proposedValue)}
        </p>
      </div>
    </div>
  );
}
