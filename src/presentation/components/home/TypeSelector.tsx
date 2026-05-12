'use client';

export type EstablishmentTypeFilter = 'restaurante' | 'bar' | 'padaria';

interface TypeOption {
  value: EstablishmentTypeFilter;
  icon: string;
  label: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  { value: 'restaurante', icon: '🍽️', label: 'Restaurante' },
  { value: 'bar', icon: '🍺', label: 'Bar / Boteco' },
  { value: 'padaria', icon: '🥐', label: 'Padaria' },
];

interface TypeSelectorProps {
  value: EstablishmentTypeFilter | null;
  onChange: (value: EstablishmentTypeFilter | null) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        marginTop: '0.75rem',
      }}
    >
      {TYPE_OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(isActive ? null : opt.value)}
            aria-pressed={isActive}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.75rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: isActive
                ? '1.5px solid var(--color-brand)'
                : '1.5px solid var(--color-border)',
              background: isActive ? 'var(--color-brand-subtle)' : 'var(--color-bg)',
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span style={{ fontSize: '1.375rem', lineHeight: 1 }}>{opt.icon}</span>
            <span
              style={{
                fontSize: 'var(--font-size-caption)',
                fontWeight: 'var(--font-weight-semibold)',
                color: isActive ? 'var(--color-brand)' : 'var(--color-text-primary)',
                textAlign: 'center',
                lineHeight: 'var(--line-height-tight)',
              }}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
