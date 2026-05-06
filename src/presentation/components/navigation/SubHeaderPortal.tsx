'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SubHeaderPortalProps {
  children: ReactNode;
}

/**
 * Renders children into the fixed #subheader-root slot positioned below TopBar.
 * State stays in the calling component — no context coupling.
 */
export function SubHeaderPortal({ children }: SubHeaderPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const root = document.getElementById('subheader-root');
  if (!root) return null;

  return createPortal(children, root);
}
