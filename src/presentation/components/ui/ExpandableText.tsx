'use client';

import { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
}

export function ExpandableText({ text, maxLines = 2 }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`text-sm text-text-secondary leading-relaxed ${!expanded ? `line-clamp-${maxLines}` : ''}`}
      >
        {text}
      </p>
      {text.length > 80 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center gap-0.5 text-sm font-medium text-brand"
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
          <span className="text-xs">{expanded ? '↑' : '↓'}</span>
        </button>
      )}
    </div>
  );
}
