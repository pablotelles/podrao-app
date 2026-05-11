'use client';

import { useRef } from 'react';

interface PhotoUploadProps {
  value: File | null;
  onChange: (f: File | null) => void;
  previewUrl?: string;
}

export function PhotoUpload({ value, onChange, previewUrl }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const objectUrl = value ? URL.createObjectURL(value) : null;
  const preview = objectUrl ?? previewUrl ?? null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] ?? null);
    e.target.value = '';
  }

  function handleRemove() {
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-md border border-border">
          <img src={preview} alt="Pré-visualização" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-text-primary/70 text-text-inverse transition-colors hover:bg-text-primary"
            aria-label="Remover foto"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border text-text-secondary transition-colors hover:border-brand hover:text-brand"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path
              d="M3 15l5-5 4 4 3-3 6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium">Adicionar foto</span>
          <span className="text-xs">Toque para selecionar da galeria</span>
        </button>
      )}

      {preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm text-brand underline-offset-2 hover:underline"
        >
          Trocar foto
        </button>
      )}
    </div>
  );
}
