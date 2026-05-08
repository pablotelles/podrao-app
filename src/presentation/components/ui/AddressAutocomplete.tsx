'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';

interface AddressAutocompleteProps {
  selected: AutocompleteResult | null;
  onSelect: (result: AutocompleteResult) => void;
  onClear: () => void;
  error?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  selected,
  onSelect,
  onClear,
  error,
  placeholder = 'Buscar endereço ou nome do lugar',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'below' | 'above'>('below');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input text when selection is set externally
  useEffect(() => {
    if (selected != null) setQuery(selected.displayName);
  }, [selected]);

  function openWithPlacement(results: AutocompleteResult[]) {
    if (results.length === 0) {
      setOpen(false);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    const spaceBelow = rect ? window.innerHeight - rect.bottom : 999;
    // max-h-60 = 240px; add 16px buffer
    setPlacement(spaceBelow < 256 ? 'above' : 'below');
    setOpen(true);
  }

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode/autocomplete?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results: AutocompleteResult[] };
      const results = data.results ?? [];
      setSuggestions(results);
      openWithPlacement(results);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    // If user edits after a selection, clear the confirmed selection
    if (selected) onClear();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(val), 300);
  };

  const handleSelect = (result: AutocompleteResult) => {
    setQuery(result.displayName);
    setSuggestions([]);
    setOpen(false);
    onSelect(result);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-1"
      style={{ zIndex: 'var(--z-dropdown)' }}
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder={placeholder}
          autoComplete="off"
          className={[
            'h-10 w-full rounded-md border px-3 text-sm text-text-primary',
            'bg-bg placeholder:text-text-disabled',
            'focus:outline-none focus:ring-2 focus:ring-brand',
            error ? 'border-error' : 'border-border',
          ].join(' ')}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
            •••
          </span>
        )}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {open && suggestions.length > 0 && (
        <ul
          className={[
            'absolute max-h-60 w-full overflow-y-auto rounded-md border border-border bg-bg shadow-lg',
            placement === 'above' ? 'bottom-11' : 'top-11',
          ].join(' ')}
          style={{ zIndex: 'var(--z-dropdown)' }}
        >
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full px-3 py-2.5 text-left hover:bg-brand-subtle"
              >
                <p className="text-sm font-medium text-text-primary">{s.displayPlace}</p>
                <p className="text-xs text-text-secondary">{s.displayAddress}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
