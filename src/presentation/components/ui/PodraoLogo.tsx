interface PodraoLogoProps {
  variant?: 'color' | 'white';
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function PodraoLogo({
  variant = 'color',
  size = 32,
  withWordmark = false,
  className,
}: PodraoLogoProps) {
  const colorClass = variant === 'white' ? 'text-text-inverse' : 'text-brand';
  const baseClass = `inline-flex items-center gap-2 ${colorClass}`;

  return (
    <span className={className ? `${baseClass} ${className}` : baseClass}>
      <svg
        width={size}
        height={Math.round(size * (64 / 42))}
        viewBox="0 0 42 64"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M 0 0 L 42 0 L 42 32 L 14 32 L 7 64 L 0 32 Z M 14 7 L 34 7 L 34 25 L 14 25 Z"
        />
      </svg>
      {withWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: size * 0.75,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            marginLeft: '-20px',
            marginTop: '15px',
          }}
        >
          odrão
        </span>
      )}
    </span>
  );
}
