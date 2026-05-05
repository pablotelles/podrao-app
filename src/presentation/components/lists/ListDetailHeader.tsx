'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, MoreHorizontal } from 'lucide-react';
import { OverlayIconButton } from '@/presentation/components/ui/OverlayIconButton';

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

      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-transparent" />

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe pt-3">
        <OverlayIconButton icon={ArrowLeft} onClick={() => router.back()} aria-label="Voltar" />

        <div className="flex gap-2">
          <OverlayIconButton icon={Share2} onClick={handleShare} aria-label="Compartilhar" />
          <OverlayIconButton icon={MoreHorizontal} aria-label="Mais opções" />
        </div>
      </div>
    </div>
  );
}
