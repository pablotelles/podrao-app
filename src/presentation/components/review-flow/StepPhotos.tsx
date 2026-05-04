'use client';

import { useState } from 'react';
import { Button } from '@/presentation/components/ui';

interface StepPhotosProps {
  photoUrls: string[];
  onPhotosChange: (urls: string[]) => void;
}

export function StepPhotos({ photoUrls, onPhotosChange }: StepPhotosProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Validar quantidade
    if (photoUrls.length + files.length > 5) {
      setUploadError('Máximo de 5 fotos por avaliação');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'review-photos');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Erro ao fazer upload da foto');
        }

        const data = (await res.json()) as { url: string };
        uploadedUrls.push(data.url);
      }

      onPhotosChange([...photoUrls, ...uploadedUrls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    onPhotosChange(photoUrls.filter((u) => u !== url));
  };

  return (
    <div className="py-4">
      <h2 className="mb-2 text-xl font-bold text-text-primary">
        Adicione fotos da sua experiência <span className="text-text-disabled">(opcional)</span>
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Fotos reais ajudam outras pessoas a conhecerem o lugar
      </p>

      {/* Grid de fotos */}
      {photoUrls.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {photoUrls.map((url, idx) => (
            <div key={url} className="relative aspect-square">
              <img
                src={url}
                alt={`Foto ${idx + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white shadow-md"
                aria-label="Remover foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botão de upload */}
      {photoUrls.length < 5 && (
        <div className="flex flex-col gap-2">
          <label htmlFor="photo-upload">
            <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface-secondary p-6 transition-colors hover:border-brand">
              <svg
                className="h-5 w-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm font-medium text-text-primary">
                {uploading ? 'Enviando...' : 'Adicionar mais fotos'}
              </span>
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-text-secondary text-center">
            {photoUrls.length}/5 fotos • JPG, PNG ou WebP
          </p>
        </div>
      )}

      {uploadError && <p className="mt-2 text-sm text-error">{uploadError}</p>}
    </div>
  );
}
