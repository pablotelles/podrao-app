'use client';

import { useRouter } from 'next/navigation';

interface VerifyIndicatorProps {
  fieldName: string;
  editId: string;
  placeId: string;
  label?: string;
}

export function VerifyIndicator({ editId, placeId, label }: VerifyIndicatorProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/places/${placeId}/edits/${editId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 transition-colors"
      style={{
        fontSize: 'var(--font-size-caption)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-verify-text)',
        backgroundColor: 'var(--color-verify-bg)',
        borderColor: 'var(--color-verify-border)',
      }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {label ?? 'em verificação'}
    </button>
  );
}
