'use client';

import { useState } from 'react';
import { useImageUpload } from '@/presentation/hooks/useImageUpload';

interface PhotoUploadGridProps {
  photoUrls: string[];
  onChange: (urls: string[]) => void;
}

export function PhotoUploadGrid({ photoUrls, onChange }: PhotoUploadGridProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { upload } = useImageUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    if (photoUrls.length + files.length > 5) {
      setUploadError('Máximo de 5 fotos por avaliação');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const url = await upload(file, 'review_photo');
        uploadedUrls.push(url);
      }

      onChange([...photoUrls, ...uploadedUrls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected after removal
      e.target.value = '';
    }
  };

  const handleRemove = (url: string) => {
    onChange(photoUrls.filter((u) => u !== url));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
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
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white text-xs shadow-md leading-none"
              aria-label="Remover foto"
            >
              ×
            </button>
          </div>
        ))}

        {photoUrls.length < 5 && (
          <label className="aspect-square cursor-pointer">
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-bg-subtle transition-colors hover:border-brand">
              <svg
                className="h-5 w-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-[10px] text-text-secondary">
                {uploading ? 'Enviando...' : 'Adicionar'}
              </span>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-text-secondary">{photoUrls.length}/5 fotos • JPG, PNG ou WebP</p>

      {uploadError && <p className="text-xs text-error">{uploadError}</p>}
    </div>
  );
}
