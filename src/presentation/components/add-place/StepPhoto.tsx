'use client';
import { Button } from '@/presentation/components/ui';
import { useRef } from 'react';

interface StepPhotoProps {
  photoFile: File | null;
  onPhotoChange: (file: File | null) => void;
  submitted: boolean;
  onViewMyPlaces: () => void;
}

export function StepPhoto({ photoFile, onPhotoChange, submitted, onViewMyPlaces }: StepPhotoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-green-700">Lugar cadastrado!</h2>
        <p className="text-text-secondary">Seu local foi adicionado com sucesso.</p>
        <Button onClick={onViewMyPlaces}>Ver meus lugares</Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <label className="block text-sm font-medium text-text-primary mb-2">
        Foto do lugar (opcional)
      </label>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Adicionar foto
        </Button>
        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Escolher da galeria
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
      />
      {photoFile && (
        <div className="mt-2">
          <img
            src={URL.createObjectURL(photoFile)}
            alt="Pré-visualização"
            className="h-32 rounded-lg object-cover"
          />
          <div className="mt-1 text-xs text-text-secondary">{photoFile.name}</div>
        </div>
      )}
    </div>
  );
}
