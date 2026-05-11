'use client';

import { useState } from 'react';
import { compressImage } from '@/infrastructure/images/ImageCompressor';
import type { ImageKind } from '@/infrastructure/images/imageCompressionConfig';

interface UseImageUploadReturn {
  upload: (file: File, kind: ImageKind) => Promise<string>;
  uploading: boolean;
  error: string | null;
}

/**
 * Hook that compresses an image client-side then POSTs it to /api/upload.
 * Replaces ad-hoc FormData+fetch patterns scattered across consumers.
 */
export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, kind: ImageKind): Promise<string> {
    setUploading(true);
    setError(null);

    try {
      const compressed = await compressImage(file, kind);

      const form = new FormData();
      form.append('file', compressed);
      form.append('kind', kind);

      const res = await fetch('/api/upload', { method: 'POST', body: form });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Erro ao fazer upload');
      }

      const { url } = (await res.json()) as { url: string };
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(msg);
      throw new Error(msg);
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, error };
}
