'use client';

import { useState, useRef, useEffect } from 'react';
import { Text } from './Text';

interface ExpandableTextProps {
  text: string;
  /** Number of lines to show before truncating. Default: 4 */
  maxLines?: number;
}

export function ExpandableText({ text, maxLines = 4 }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    // With overflow:hidden + maxHeight, scrollHeight = full content height,
    // clientHeight = constrained height. Difference means hidden content exists.
    setHasOverflow(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div>
      <p
        ref={textRef}
        className="leading-relaxed text-text-secondary"
        style={{
          fontSize: 'var(--font-size-body)',
          // 1.625em = one line (leading-relaxed). maxLines * 1.625em = exact N-line height.
          maxHeight: expanded ? 'none' : `calc(${maxLines} * 1.625em)`,
          overflow: expanded ? 'visible' : 'hidden',
        }}
      >
        {text}
      </p>
      {hasOverflow && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center gap-0.5"
        >
          <Text as="span" variant="label" textColor="brand">
            {expanded ? 'Ver menos' : 'Ver mais'}
          </Text>
          <Text as="span" variant="caption">
            {expanded ? '↑' : '↓'}
          </Text>
        </button>
      )}
    </div>
  );
}
