export function MapSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e8e0d8]">
      {/* Ruas horizontais */}
      {[12, 28, 44, 58, 72, 86].map((top) => (
        <div
          key={top}
          className="absolute left-0 right-0 animate-pulse"
          style={{ top: `${top}%`, height: top % 3 === 0 ? 6 : 3, background: '#d4ccc4' }}
        />
      ))}

      {/* Ruas verticais */}
      {[10, 25, 40, 55, 68, 82].map((left) => (
        <div
          key={left}
          className="absolute top-0 bottom-0 animate-pulse"
          style={{ left: `${left}%`, width: left % 4 === 0 ? 6 : 3, background: '#d4ccc4' }}
        />
      ))}

      {/* Quarteirões com leve variação de cor */}
      {[
        { top: 15, left: 12, w: 11, h: 11 },
        { top: 15, left: 27, w: 16, h: 11 },
        { top: 15, left: 57, w: 9, h: 11 },
        { top: 30, left: 12, w: 11, h: 12 },
        { top: 30, left: 27, w: 16, h: 12 },
        { top: 30, left: 45, w: 8, h: 12 },
        { top: 30, left: 57, w: 9, h: 12 },
        { top: 46, left: 12, w: 11, h: 10 },
        { top: 46, left: 45, w: 8, h: 10 },
        { top: 46, left: 57, w: 9, h: 10 },
        { top: 60, left: 12, w: 11, h: 10 },
        { top: 60, left: 27, w: 16, h: 10 },
        { top: 60, left: 57, w: 23, h: 10 },
      ].map((b, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            top: `${b.top}%`,
            left: `${b.left}%`,
            width: `${b.w}%`,
            height: `${b.h}%`,
            background: i % 3 === 0 ? '#ddd6ce' : '#e2dbd3',
          }}
        />
      ))}

      {/* Pin central pulsante */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Anel externo pulsante */}
          <div
            className="absolute rounded-full bg-brand/20"
            style={{
              width: 56,
              height: 56,
              animation: 'map-pulse 1.8s ease-out infinite',
            }}
          />
          {/* Anel médio */}
          <div
            className="absolute rounded-full bg-brand/30"
            style={{
              width: 36,
              height: 36,
              animation: 'map-pulse 1.8s ease-out 0.3s infinite',
            }}
          />
          {/* Ponto central */}
          <div
            className="relative z-10 rounded-full bg-brand border-2 border-white"
            style={{ width: 18, height: 18, boxShadow: '0 2px 8px rgba(249,115,22,0.4)' }}
          />
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 shadow-(--shadow-card)">
          <p className="text-sm font-medium text-text-secondary">Obtendo localização…</p>
        </div>
      </div>
    </div>
  );
}
