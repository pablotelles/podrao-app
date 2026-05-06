'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  Map,
  Bookmark,
} from 'lucide-react';
import { OverlayIconButton } from '@/presentation/components/ui/OverlayIconButton';
import { ActionSheet } from '@/presentation/components/ui/ActionSheet';
import { PlacesMapDrawer } from '@/presentation/components/ui/PlacesMapDrawer';
import { ReorderPlacesDrawer } from './ReorderPlacesDrawer';
import { useLists } from '@/presentation/hooks/useLists';
import { useListActions } from '@/presentation/hooks/useListActions';
import type { Place } from '@/domain/entities/Place';

interface ListDetailHeaderProps {
  coverUrl?: string;
  name: string;
  listId: string;
  isOwner: boolean;
  isLoggedIn: boolean;
  initialSaved: boolean;
  initialSavesCount: number;
  places: Place[];
}

export function ListDetailHeader({
  coverUrl,
  name,
  listId,
  isOwner,
  isLoggedIn,
  initialSaved,
  initialSavesCount,
  places,
}: ListDetailHeaderProps) {
  const router = useRouter();
  const { deleteList } = useLists();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const { isSaved, toggleSave } = useListActions({
    listId,
    initialFavorited: false,
    initialSaved,
    initialFavoritesCount: 0,
    initialSavesCount,
  });

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Excluir a lista "${name}"? Esta ação não pode ser desfeita.`)) return;
    await deleteList(listId);
    router.replace('/lists');
  };

  const ownerActions = isOwner
    ? [
        {
          icon: <Pencil className="h-5 w-5" />,
          label: 'Editar lista',
          onClick: () => router.push(`/lists/${listId}/edit`),
        },
        {
          icon: <ArrowUpDown className="h-5 w-5" />,
          label: 'Reordenar lugares',
          onClick: () => setReorderOpen(true),
        },
        {
          icon: <Trash2 className="h-5 w-5" />,
          label: 'Excluir lista',
          onClick: handleDelete,
          variant: 'danger' as const,
        },
      ]
    : [];

  const actions = [
    {
      icon: <Share2 className="h-5 w-5" />,
      label: 'Compartilhar lista',
      onClick: handleShare,
    },
    {
      icon: <Map className="h-5 w-5" />,
      label: 'Ver no mapa',
      onClick: () => setMapOpen(true),
    },
    ...ownerActions,
  ];

  return (
    <>
      <div className="relative h-52 w-full bg-bg-subtle">
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
            <OverlayIconButton
              icon={Bookmark}
              iconProps={{ fill: isSaved ? 'currentColor' : 'none' }}
              onClick={isLoggedIn ? toggleSave : undefined}
              aria-label={isSaved ? 'Remover dos salvos' : 'Salvar lista'}
            />
            <OverlayIconButton
              icon={MoreHorizontal}
              onClick={() => setSheetOpen(true)}
              aria-label="Mais opções"
            />
          </div>
        </div>
      </div>

      <ActionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} actions={actions} />

      <ReorderPlacesDrawer
        open={reorderOpen}
        onClose={() => setReorderOpen(false)}
        listId={listId}
        initialPlaces={places}
      />

      <PlacesMapDrawer
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        places={places}
        title={name}
      />
    </>
  );
}
