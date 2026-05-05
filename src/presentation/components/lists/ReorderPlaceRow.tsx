'use client';

import Image from 'next/image';
import { GripVertical, MapPin } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Place } from '@/domain/entities/Place';

interface ReorderPlaceRowProps {
  place: Place;
  position: number;
}

export function ReorderPlaceRow({ place, position }: ReorderPlaceRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const subtitle = [place.establishmentType, place.bairro].filter(Boolean).join(' · ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-bg py-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 touch-none text-text-secondary"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Posição */}
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-text-secondary">
        {position}
      </span>

      {/* Thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg-subtle">
        {place.logoUrl ? (
          <Image src={place.logoUrl} alt={place.name} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPin className="h-4 w-4 text-text-secondary" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary leading-tight">
          {place.name}
        </p>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-text-secondary">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
