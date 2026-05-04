'use client';

interface RadioListItemProps {
  icon?: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function RadioListItem({
  icon,
  label,
  description,
  selected,
  onSelect,
  disabled,
}: RadioListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={[
        'flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0',
        selected ? 'bg-brand-subtle' : 'bg-surface hover:bg-surface-hover',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {icon && <span className="text-xl leading-none">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p
          className={['text-sm font-medium', selected ? 'text-brand' : 'text-text-primary'].join(
            ' ',
          )}
        >
          {label}
        </p>
        {description && <p className="text-xs text-text-secondary">{description}</p>}
      </div>
      <span
        className={[
          'h-5 w-5 shrink-0 rounded-full border-2 transition-all',
          selected ? 'border-brand bg-brand' : 'border-border bg-transparent',
        ].join(' ')}
      >
        {selected && (
          <span className="flex h-full w-full items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
        )}
      </span>
    </button>
  );
}
