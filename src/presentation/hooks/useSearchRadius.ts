'use client';

import { useLocalStorage } from './useLocalStorage';

export const RADIUS_MIN = 500;
export const RADIUS_MAX = 50000;
export const RADIUS_STEP = 500;
export type SearchRadius = number;

const DEFAULT_RADIUS: SearchRadius = 500;
const STORAGE_KEY = 'podrao_search_radius';

export function useSearchRadius() {
  const [radius, setRadius] = useLocalStorage<SearchRadius>(STORAGE_KEY, DEFAULT_RADIUS);
  return { radius, setRadius };
}
