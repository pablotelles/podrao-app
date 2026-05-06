'use client';

import { useEffect } from 'react';

/**
 * Sets --subheader-height on the root element while the component is mounted.
 * Resets to 0px on unmount, so pages without a subheader have no padding overhead.
 *
 * @param heightPx - height of the subheader in pixels (default: 52)
 */
export function useSubHeaderHeight(heightPx = 52) {
  useEffect(() => {
    document.documentElement.style.setProperty('--subheader-height', `${heightPx}px`);
    return () => {
      document.documentElement.style.setProperty('--subheader-height', '0px');
    };
  }, [heightPx]);
}
