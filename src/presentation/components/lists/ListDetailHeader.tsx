'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, MoreHorizontal } from 'lucide-react';

interface ListDetailHeaderProps {
  coverUrl?: string;
  name: string;
}

export function ListDetailHeader({ coverUrl, name }: ListDetailHeaderProps) {
  const router = useRouter();

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="relative h-40 w-full bg-bg-subtle">
      {coverUrl ? (
        <Image src={coverUrl} alt={name} fill className="object-cover" priority sizes="100vw" />
      ) : (
        <div className="h-full w-full bg-linear-to-br from-brand-subtle to-bg-subtle" />
      )}

      {/* Overlay gradient para legibilidade dos botões */}
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-transparent" />

      {/* Botões de navegação */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe pt-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
            aria-label="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
