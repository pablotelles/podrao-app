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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(val), 300);
  };

  const handleSelect = (result: AutocompleteResult) => {
    setQuery('');
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

  if (selected) {
    return (
      <div className="flex flex-col gap-1">
        <div
          className={[
            'flex items-start justify-between rounded-md border px-3 py-2.5',
            error ? 'border-error' : 'border-border',
            'bg-bg',
          ].join(' ')}
        >
          <div>
            <p className="text-sm font-medium text-text-primary">{selected.displayPlace}</p>
            <p className="text-xs text-text-secondary">{selected.displayAddress}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="ml-3 mt-0.5 shrink-0 text-xs text-brand"
          >
            Alterar
          </button>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative z-9999 flex flex-col gap-1">
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
        <ul className="absolute top-11 z-50 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-bg shadow-lg">
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
