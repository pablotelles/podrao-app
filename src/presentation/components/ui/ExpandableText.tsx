'use client';

import { useState } from 'react';
import { Text } from './Text';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
}

export function ExpandableText({ text, maxLines = 2 }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <Text
        as="p"
        variant="body"
        textColor="secondary"
        className={`leading-relaxed ${!expanded ? `line-clamp-${maxLines}` : ''}`}
      >
        {text}
      </Text>
      {text.length > 80 && (
        <button onClick={() => setExpanded((v) => !v)} className="mt-1 flex items-center gap-0.5">
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
