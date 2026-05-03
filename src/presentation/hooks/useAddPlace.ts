'use client';

import { useState } from 'react';
import type { CreatePlaceInput } from '@/presentation/lib/schemas/placeSchema';
import type { Place } from '@/domain/entities/Place';

export function useAddPlace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(data: CreatePlaceInput): Promise<Place | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error: string };
        throw new Error(body.error);
      }
      return (await res.json()) as Place;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar lugar');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) return null;
    const { url } = (await res.json()) as { url: string };
    return url;
  }

  return { submit, uploadPhoto, loading, error };
}
