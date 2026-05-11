'use client';

import { useState } from 'react';
import { Sheet, Button } from '@/presentation/components/ui';
import { DynamicLocationPickerMap } from '@/presentation/components/maps/dynamic';

// São Paulo centro — fallback quando não há GPS
const DEFAULT_LAT = -23.5505;
const DEFAULT_LNG = -46.6333;

interface LocationPickerSheetProps {
  open: boolean;
  onClose: () => void;
  initialLat?: number | null;
  initialLng?: number | null;
  onConfirm: (lat: number, lng: number) => void;
}

export function LocationPickerSheet({
  open,
  onClose,
  initialLat,
  initialLng,
  onConfirm,
}: LocationPickerSheetProps) {
  const startLat = initialLat ?? DEFAULT_LAT;
  const startLng = initialLng ?? DEFAULT_LNG;

  // picked é nulo até o usuário mover o pin — confirm usa start como fallback
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);

  function handleConfirm() {
    const { lat, lng } = picked ?? { lat: startLat, lng: startLng };
    onConfirm(lat, lng);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Selecionar no mapa">
      <DynamicLocationPickerMap
        lat={picked?.lat ?? startLat}
        lng={picked?.lng ?? startLng}
        onLocationChange={(lat, lng) => setPicked({ lat, lng })}
        height="340px"
      />
      <Button className="mt-4 w-full" onClick={handleConfirm}>
        Confirmar localização
      </Button>
    </Sheet>
  );
}
