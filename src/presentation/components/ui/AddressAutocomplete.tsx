'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, Loader2, SearchX } from 'lucide-react';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';
import { AddressSuggestionItem } from '@/presentation/components/ui/AddressSuggestionItem';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';

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
  const [fetchError, setFetchError] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [placement, setPlacement] = useState<'below' | 'above'>('below');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected != null) setQuery(selected.displayName);
  }, [selected]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function openWithPlacement() {
    const rect = containerRef.current?.getBoundingClientRect();
    const spaceBelow = rect ? window.innerHeight - rect.bottom : 999;
    setPlacement(spaceBelow < 256 ? 'above' : 'below');
    setOpen(true);
  }

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(`/api/geocode/autocomplete?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { results: AutocompleteResult[] };
      const results = data.results ?? [];
      setSuggestions(results);
      setHasSearched(true);
      openWithPlacement();
    } catch {
      setSuggestions([]);
      setFetchError(true);
      setHasSearched(true);
      openWithPlacement();
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (selected) onClear();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(val), 300);
  };

  const handleSelect = (result: AutocompleteResult) => {
    setQuery(result.displayName);
    setSuggestions([]);
    setOpen(false);
    setHasSearched(false);
    onSelect(result);
  };

  const hasExternalError = !!error;

  const pinColor = hasExternalError
    ? 'var(--color-error)'
    : focused
      ? 'var(--color-brand)'
      : 'var(--color-text-disabled)';

  const borderColor = hasExternalError
    ? 'var(--color-error)'
    : focused
      ? 'var(--color-brand)'
      : 'var(--color-border)';

  const focusRing = focused
    ? `0 0 0 3px ${hasExternalError ? 'rgb(220 38 38 / 0.12)' : 'rgb(88 86 214 / 0.12)'}`
    : undefined;

  const showDropdown = open && hasSearched;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      {/* Input row */}
      <div
        className="flex h-10 items-center gap-2.5 rounded-md border bg-bg px-3 transition-colors"
        style={{ borderColor, boxShadow: focusRing }}
      >
        <MapPin size={16} className="shrink-0 transition-colors" style={{ color: pinColor }} />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-disabled"
        />
        {loading && <Loader2 size={14} className="shrink-0 animate-spin text-text-secondary" />}
      </div>

      {hasExternalError && (
        <Text as="p" variant="caption" textColor="error">
          {error}
        </Text>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <ul
          className={[
            'absolute left-0 right-0 overflow-hidden rounded-sm border border-border bg-bg',
            'divide-y divide-border shadow-[0_8px_24px_rgb(0_0_0/0.12)]',
            placement === 'above' ? 'bottom-11' : 'top-11',
          ].join(' ')}
          style={{ zIndex: 'var(--z-overlay)' }}
        >
          {fetchError ? (
            <li className="flex flex-col items-center gap-3 px-4 py-5">
              <Text as="p" variant="label" textColor="secondary">
                Falha ao buscar endereços
              </Text>
              <Button variant="ghost" size="sm" onClick={() => void search(query)}>
                Tentar de novo
              </Button>
            </li>
          ) : suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <li key={i}>
                <AddressSuggestionItem result={s} onClick={() => handleSelect(s)} />
              </li>
            ))
          ) : (
            <li className="flex items-center gap-3 px-4 py-4">
              <SearchX size={16} className="shrink-0 text-text-disabled" />
              <Text as="p" variant="label" textColor="secondary">
                Nenhum endereço encontrado
              </Text>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
