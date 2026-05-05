'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { FullScreenDrawer } from '@/presentation/components/ui/FullScreenDrawer';
import { AddPlaceResultRow } from './AddPlaceResultRow';
import type { Place } from '@/domain/entities/Place';

interface AddPlaceToListDrawerProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  existingPlaceIds: Set<string>;
  onPlaceAdded: (placeId: string) => void;
}

export function AddPlaceToListDrawer({
  open,
  onClose,
  listId,
  existingPlaceIds,
  onPlaceAdded,
}: AddPlaceToListDrawerProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedThisSession, setAddedThisSession] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca o input ao abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery('');
      setResults([]);
      setAddedThisSession(new Set());
    }
  }, [open]);

  // Busca com debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = (await res.json()) as Place[];
          setResults(data);
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleAdd = async (place: Place) => {
    if (addingId) return;
    setAddingId(place.id);
    try {
      const res = await fetch(`/api/lists/${listId}/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: place.id }),
      });
      if (!res.ok) throw new Error('Erro ao adicionar lugar');
      setAddedThisSession((prev) => new Set(prev).add(place.id));
      onPlaceAdded(place.id);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  const isAdded = (placeId: string) =>
    existingPlaceIds.has(placeId) || addedThisSession.has(placeId);

  return (
    <FullScreenDrawer open={open} onClose={onClose} title="Adicionar lugar">
      <div className="flex h-full flex-col">
        {/* Search input */}
        <div className="px-(--spacing-page-x) py-3">
          <div className="flex items-center gap-2 rounded-xl bg-bg-subtle px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-text-secondary" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Buscar lugares..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto px-(--spacing-page-x)">
          {isSearching && (
            <p className="py-8 text-center text-sm text-text-secondary">Buscando...</p>
          )}

          {!isSearching && query.trim() && results.length === 0 && (
            <p className="py-8 text-center text-sm text-text-secondary">
              Nenhum resultado para &ldquo;{query}&rdquo;
            </p>
          )}

          {!isSearching && results.length > 0 && (
            <>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Resultados
              </p>
              <div className="divide-y divide-border">
                {results.map((place) => (
                  <AddPlaceResultRow
                    key={place.id}
                    place={place}
                    added={isAdded(place.id)}
                    loading={addingId === place.id}
                    onAdd={() => handleAdd(place)}
                  />
                ))}
              </div>
            </>
          )}

          {!query.trim() && (
            <p className="py-8 text-center text-sm text-text-secondary">
              Digite o nome do lugar que deseja adicionar.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-(--spacing-page-x) py-4 pb-safe">
          <p className="mb-2 text-xs text-text-secondary">Não encontrou o que queria?</p>
          <button
            onClick={() => {
              onClose();
              router.push('/add-place');
            }}
            className="flex w-full items-center justify-between rounded-xl border border-dashed border-brand px-4 py-3 text-sm font-semibold text-brand hover:bg-brand/5 transition-colors"
          >
            <span>Adicionar novo lugar</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </FullScreenDrawer>
  );
}
