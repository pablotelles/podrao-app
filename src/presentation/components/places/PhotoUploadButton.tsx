'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge } from '@/presentation/components/ui';
import { useUpdatePlacePhoto } from '@/presentation/hooks/useUpdatePlacePhoto';

interface PhotoUploadButtonProps {
  placeId: string;
  hasPhoto: boolean;
}

export function PhotoUploadButton({ placeId, hasPhoto }: PhotoUploadButtonProps) {
  const router = useRouter();
  const { updatePhoto, uploading, error } = useUpdatePlacePhoto();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const updated = await updatePhoto(placeId, file);
    if (updated) {
      setSelectedFile(null);
      router.refresh(); // Recarrega a página para mostrar a nova foto
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <Button
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : hasPhoto ? '📷 Alterar foto' : '📷 Adicionar foto'}
      </Button>

      {selectedFile && <Badge variant="brand">{selectedFile.name}</Badge>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
