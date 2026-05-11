'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';
import { LocationPickerSheet } from '@/presentation/components/home/LocationPickerSheet';
import { AddressSuggestionItem } from '@/presentation/components/ui/AddressSuggestionItem';

interface LocationBarProps {
  locationLabel: string | null;
  loading?: boolean;
  currentLat?: number | null;
  currentLng?: number | null;
  onLocationSearch: (lat: number, lng: number, label: string) => void;
  onRetryGps: () => void;
}

export function LocationBar({
  locationLabel,
  loading,
  currentLat,
  currentLng,
  onLocationSearch,
  onRetryGps,
}: LocationBarProps) {
  const [searchMode, setSearchMode] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [waitingForGps, setWaitingForGps] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // When GPS resolves while waiting, exit search mode — pill will show
  useEffect(() => {
    if (waitingForGps && locationLabel) {
      setWaitingForGps(false);
      setSearchMode(false);
      setQuery('');
    }
  }, [locationLabel, waitingForGps]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      setDropdownOpen(false);
      return;
    }
    setAutocompleteLoading(true);
    try {
      const res = await fetch(`/api/geocode/autocomplete?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results: AutocompleteResult[] };
      const results = data.results ?? [];
      setSuggestions(results);
      setDropdownOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setAutocompleteLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(val), 300);
  };

  const handleSelect = (result: AutocompleteResult) => {
    setSuggestions([]);
    setDropdownOpen(false);
    setSearchMode(false);
    setWaitingForGps(false);
    setQuery('');
    onLocationSearch(result.lat, result.lng, result.displayName);
  };

  const handleGps = () => {
    setWaitingForGps(true);
    setDropdownOpen(false);
    setSuggestions([]);
    onRetryGps();
  };

  const handlePickerConfirm = (lat: number, lng: number) => {
    setSearchMode(false);
    setQuery('');
    onLocationSearch(lat, lng, '');
  };

  if (loading) {
    return (
      <div className="px-(--spacing-page-x) pb-3 pt-3.5">
        <div className="flex items-center gap-2 rounded-full bg-bg-subtle px-3.5 py-2">
          <MapPin size={16} className="shrink-0 text-brand" />
          <span className="text-text-secondary" style={{ fontSize: 'var(--font-size-label)' }}>
            Obtendo localização…
          </span>
        </div>
      </div>
    );
  }

  if (searchMode || locationLabel === null) {
    return (
      <>
        <div
          ref={containerRef}
          className="relative px-(--spacing-page-x) pb-3 pt-3.5"
          style={{ zIndex: 'var(--z-dropdown)' }}
        >
          <div className="flex items-center gap-2 rounded-full border border-brand bg-bg-subtle px-3.5 py-2">
            <Search size={16} className="shrink-0 text-text-disabled" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="Onde você está?"
              autoComplete="off"
              className="flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-disabled"
              style={{ fontSize: 'var(--font-size-label)' }}
            />
            {autocompleteLoading && (
              <span
                className="text-text-secondary"
                style={{ fontSize: 'var(--font-size-caption)' }}
              >
                •••
              </span>
            )}
          </div>

          {dropdownOpen && suggestions.length > 0 && (
            <ul
              className="absolute inset-x-(--spacing-page-x) top-full mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-bg shadow-lg"
              style={{ zIndex: 'var(--z-dropdown)' }}
            >
              {suggestions.map((s, i) => (
                <li key={i}>
                  <AddressSuggestionItem result={s} onClick={() => handleSelect(s)} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-1.5 flex items-center gap-3 px-1">
            <button
              type="button"
              onClick={handleGps}
              className="text-brand"
              style={{ fontSize: 'var(--font-size-caption)' }}
            >
              Usar GPS
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-brand"
              style={{ fontSize: 'var(--font-size-caption)' }}
            >
              Selecionar no mapa
            </button>
            {locationLabel !== null && (
              <button
                type="button"
                onClick={() => {
                  setSearchMode(false);
                  setDropdownOpen(false);
                  setSuggestions([]);
                }}
                className="text-text-secondary"
                style={{ fontSize: 'var(--font-size-caption)' }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <LocationPickerSheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          initialLat={currentLat}
          initialLng={currentLng}
          onConfirm={handlePickerConfirm}
        />
      </>
    );
  }

  return (
    <div className="px-(--spacing-page-x) pb-3 pt-3.5">
      <button
        onClick={() => setSearchMode(true)}
        aria-label="Alterar localização"
        className="flex w-full items-center gap-2 rounded-full bg-bg-subtle px-3.5 py-2"
      >
        <MapPin size={16} className="shrink-0 text-brand" />
        <div className="min-w-0 flex-1 text-left">
          <p
            className="font-medium uppercase tracking-wide text-text-secondary"
            style={{ fontSize: 'var(--font-size-caption)' }}
          >
            Perto de
          </p>
          <p
            className="truncate font-semibold text-text-primary"
            style={{ fontSize: 'var(--font-size-label)' }}
          >
            {locationLabel}
          </p>
        </div>
        <ChevronDown size={14} className="shrink-0 text-text-disabled" />
      </button>
    </div>
  );
}
