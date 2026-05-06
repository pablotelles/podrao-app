'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { Place } from '@/domain/entities/Place';
import { FullScreenDrawer } from '@/presentation/components/ui/FullScreenDrawer';
import { Button } from '@/presentation/components/ui/Button';
import { ReorderPlaceRow } from './ReorderPlaceRow';

interface ReorderPlacesDrawerProps {
  open: boolean;
  onClose: () => void;
  listId: string;
  initialPlaces: Place[];
}

export function ReorderPlacesDrawer({
  open,
  onClose,
  listId,
  initialPlaces,
}: ReorderPlacesDrawerProps) {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPlaces((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lists/${listId}/places/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeIds: places.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error('Erro ao salvar ordem');
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenDrawer open={open} onClose={onClose} title="Reordenar lugares">
      <div className="flex h-full flex-col">
        {/* Lista sortável */}
        <div className="flex-1 overflow-y-auto px-(--spacing-page-x)">
          {places.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-secondary">
              Nenhum lugar nesta lista.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={places.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-border">
                  {places.map((place, i) => (
                    <ReorderPlaceRow key={place.id} place={place} position={i + 1} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-(--spacing-page-x) py-4 pb-safe">
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar ordem'}
          </Button>
        </div>
      </div>
    </FullScreenDrawer>
  );
}
