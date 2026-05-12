export const RECENT_SEARCHES_KEY = 'podrao_recent_searches';
const MAX_RECENTS = 5;

export function addRecentSearch(term: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const current: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    const deduped = [term, ...current.filter((t) => t !== term)].slice(0, MAX_RECENTS);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(deduped));
  } catch {
    // storage unavailable — ignore
  }
}
