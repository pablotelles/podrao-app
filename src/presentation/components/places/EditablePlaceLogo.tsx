'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, UtensilsCrossed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUpdatePlacePhoto } from '@/presentation/hooks/useUpdatePlacePhoto';

interface EditablePlaceLogoProps {
  placeId: string;
  logoUrl?: string;
  name: string;
}

export function EditablePlaceLogo({ placeId, logoUrl, name }: EditablePlaceLogoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { updatePhoto, uploading } = useUpdatePlacePhoto();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const updated = await updatePhoto(placeId, file);
    if (updated) {
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    }
  };

  return (
    <div className="relative h-16 w-16 shrink-0">
      {/* Logo */}
      <div className="h-16 w-16 overflow-hidden rounded-xl border border-border">
        {logoUrl ? (
          <Image src={logoUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-subtle">
            <UtensilsCrossed className="h-7 w-7 text-brand" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Camera overlay */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-text-inverse shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
        aria-label="Alterar foto do lugar"
      >
        <Camera size={12} />
      </button>

      {/* Loading overlay */}
      {uploading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl"
          style={{ background: 'var(--color-overlay-scrim)' }}
        >
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
