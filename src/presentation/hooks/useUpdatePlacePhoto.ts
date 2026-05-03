'use client';

import { useState } from 'react';
import type { Place } from '@/domain/entities/Place';

export function useUpdatePlacePhoto() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updatePhoto(placeId: string, file: File): Promise<Place | null> {
    setUploading(true);
    setError(null);

    try {
      // 1. Upload da foto
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Erro ao fazer upload da foto');
      }

      const { url } = (await uploadRes.json()) as { url: string };

      // 2. Atualizar o lugar com a nova URL
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar foto');
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { updatePhoto, uploading, error };
}
