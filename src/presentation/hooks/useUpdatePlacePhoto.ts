'use client';

import type { Place } from '@/domain/entities/Place';
import { useImageUpload } from '@/presentation/hooks/useImageUpload';

export function useUpdatePlacePhoto() {
  const { upload, uploading, error } = useImageUpload();

  async function updatePhoto(placeId: string, file: File): Promise<Place | null> {
    try {
      const url = await upload(file, 'place_cover');

      const updateRes = await fetch(`/api/places/${placeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: url }),
      });

      if (!updateRes.ok) {
        const body = (await updateRes.json()) as { error: string };
        throw new Error(body.error);
      }

      return (await updateRes.json()) as Place;
    } catch {
      return null;
    }
  }

  return { updatePhoto, uploading, error };
}
