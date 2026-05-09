'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ActionSheet } from '@/presentation/components/ui';
import { useToast } from '@/presentation/hooks/useToast';

interface DeleteReviewSheetProps {
  reviewId: string;
  placeId: string;
  placeName: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteReviewSheet({
  reviewId,
  placeId,
  placeName,
  open,
  onClose,
  onDeleted,
}: DeleteReviewSheetProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/places/${placeId}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao excluir avaliação');

      onDeleted();
      showToast({ type: 'success', title: 'Avaliação excluída' });
    } catch {
      showToast({ type: 'error', title: 'Erro ao excluir' });
    } finally {
      setLoading(false);
      onClose();
    }
  }

  return (
    <ActionSheet
      open={open}
      onClose={onClose}
      header={
        <p className="text-sm font-medium text-text-primary">
          Excluir avaliação de <span className="font-semibold">{placeName}</span>?
        </p>
      }
      actions={[
        {
          icon: <Trash2 size={16} />,
          label: loading ? 'Excluindo...' : 'Excluir',
          variant: 'danger',
          onClick: () => void handleDelete(),
        },
      ]}
    />
  );
}
