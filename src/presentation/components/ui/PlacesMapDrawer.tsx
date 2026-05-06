'use client';

import type { Place } from '@/domain/entities/Place';
import { FullScreenDrawer } from './FullScreenDrawer';
import { DynamicPlaceMap } from '@/presentation/components/maps/dynamic';

interface PlacesMapDrawerProps {
  open: boolean;
  onClose: () => void;
  places: Place[];
  title?: string;
}

export function PlacesMapDrawer({
  open,
  onClose,
  places,
  title = 'Ver no mapa',
}: PlacesMapDrawerProps) {
  return (
    <FullScreenDrawer open={open} onClose={onClose} title={title}>
      <div className="h-full">
        <DynamicPlaceMap places={places} height="100%" />
      </div>
    </FullScreenDrawer>
  );
}
