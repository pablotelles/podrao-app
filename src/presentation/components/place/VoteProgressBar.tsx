interface VoteProgressBarProps {
  confirmCount: number;
  contestCount: number;
}

export function VoteProgressBar({ confirmCount, contestCount }: VoteProgressBarProps) {
  const total = confirmCount + contestCount;

  const confirmPct = total > 0 ? Math.round((confirmCount / total) * 100) : 0;
  const contestPct = total > 0 ? 100 - confirmPct : 0;

  return (
    <div>
      {/* Barra */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg-subtle">
        {total > 0 ? (
          <>
            {confirmPct > 0 && (
              <div
                className="h-full transition-all"
                style={{
                  width: `${confirmPct}%`,
                  backgroundColor: 'var(--color-success)',
                }}
              />
            )}
            {contestPct > 0 && (
              <div
                className="h-full transition-all"
                style={{
                  width: `${contestPct}%`,
                  backgroundColor: 'var(--color-warning)',
                }}
              />
            )}
          </>
        ) : (
          <div className="h-full w-full rounded-full bg-bg-subtle" />
        )}
      </div>

      {/* Label */}
      <p
        className="mt-1.5"
        style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
      >
        <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-weight-medium)' }}>
          {confirmCount} confirmaram
        </span>
        {' · '}
        <span style={{ color: 'var(--color-warning)', fontWeight: 'var(--font-weight-medium)' }}>
          {contestCount} contestaram
        </span>
      </p>
    </div>
  );
}
