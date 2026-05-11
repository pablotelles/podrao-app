'use client';

import { useState, useRef } from 'react';
import { mutate } from 'swr';
import type { CreatePlaceInput } from '@/presentation/lib/schemas/placeSchema';
import type { Place } from '@/domain/entities/Place';
import { useToast } from '@/presentation/hooks/useToast';
import { useImageUpload } from '@/presentation/hooks/useImageUpload';

export function useAddPlace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const { showToast } = useToast();
  const { upload } = useImageUpload();

  async function submit(data: CreatePlaceInput): Promise<Place | null> {
    // Prevenir submits simultâneos
    if (submittingRef.current) {
      return null;
    }

    submittingRef.current = true;
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
      const place = (await res.json()) as Place;
      // Revalidar stats do usuário (quando o lugar for aprovado, a contagem aumenta)
      mutate('/api/me/stats');
      showToast({
        type: 'success',
        title: 'Lugar enviado para análise!',
        message: 'Será avaliado pela comunidade',
      });
      return place;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar lugar';
      setError(msg);
      showToast({ type: 'error', title: 'Erro ao cadastrar lugar', message: msg });
      return null;
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  async function uploadPhoto(file: File, isCover = false): Promise<string | null> {
    try {
      return await upload(file, isCover ? 'place_cover' : 'place_gallery');
    } catch {
      return null;
    }
  }

  return { submit, uploadPhoto, loading, error };
}
