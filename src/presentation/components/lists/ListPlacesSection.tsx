'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, Map, Plus, ChevronDown } from 'lucide-react';
import type { Place } from '@/domain/entities/Place';
import { Button } from '@/presentation/components/ui/Button';
import { ListPlaceCard } from './ListPlaceCard';
import { AddPlaceToListDrawer } from './AddPlaceToListDrawer';

interface ListPlacesSectionProps {
  places: Place[];
  isOwner: boolean;
  listId: string;
}

export function ListPlacesSection({ places, isOwner, listId }: ListPlacesSectionProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(
    () => new Set(places.map((p) => p.id)),
  );

  const handlePlaceAdded = (placeId: string) => {
    setAddedIds((prev) => new Set(prev).add(placeId));
    router.refresh();
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      {/* Header: Ordenar + Ver no mapa */}
      <div className="flex items-center justify-between">
        <button className="flex flex-col" aria-label="Ordenar">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-brand">
            <SlidersHorizontal className="h-4 w-4" />
            Ordenar
          </span>
          <span className="flex items-center gap-0.5 pl-5.5 text-xs text-text-secondary">
            Personalizado
            <ChevronDown className="h-3 w-3" />
          </span>
        </button>

        <button className="flex items-center gap-1.5 text-sm font-semibold text-brand" aria-label="Ver no mapa">
          <Map className="h-4 w-4" />
          Ver no mapa
        </button>
      </div>

      {/* Lista com borda */}
      <div className="rounded-xl border border-border">
        {places.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            Nenhum lugar nesta lista ainda.
          </p>
        ) : (
          <div className="divide-y divide-border px-3">
            {places.map((place, i) => (
              <ListPlaceCard key={place.id} place={place} position={i + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Botão Adicionar lugar (só dono) */}
      {isOwner && (
        <Button
          variant="dashed"
          size="md"
          className="w-full"
          onClick={() => setDrawerOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar lugar
        </Button>
      )}

      {/* Drawer de busca */}
      {isOwner && (
        <AddPlaceToListDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          listId={listId}
          existingPlaceIds={addedIds}
          onPlaceAdded={handlePlaceAdded}
        />
      )}
    </div>
  );
}
