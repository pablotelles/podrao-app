'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import type { VariantProps } from 'class-variance-authority';

const avatarVariants = {} as any; // Apenas para tipagem

interface EditableAvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onUpdate?: (newAvatarUrl: string) => void;
}

export function EditableAvatar({ src, alt, fallback, size, onUpdate }: EditableAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1. Upload da imagem
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Erro ao fazer upload da imagem');

      const { url } = (await uploadRes.json()) as { url: string };

      // 2. Atualizar perfil com nova avatarUrl
      const updateRes = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: url }),
      });

      if (!updateRes.ok) throw new Error('Erro ao atualizar perfil');

      // 3. Notificar componente pai
      onUpdate?.(url);
    } catch (err) {
      console.error('Erro ao atualizar avatar:', err);
      alert('Erro ao atualizar foto de perfil. Tente novamente.');
    } finally {
      setUploading(false);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <UserAvatar src={src} alt={alt} fallback={fallback} size={size} />

      {/* Botão de editar */}
      <button
        onClick={handleClick}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-text-inverse shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
        aria-label="Alterar foto de perfil"
      >
        <Camera size={14} />
      </button>

      {/* Input file escondido */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Loading overlay */}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
          <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
