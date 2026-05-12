'use client';

import useSWR from 'swr';
import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';

async function fetcher(url: string): Promise<PlaceEditWithVotes[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar edições');
  return res.json() as Promise<PlaceEditWithVotes[]>;
}

interface EditSummary {
  id: string;
  newValue: unknown;
  confirmCount: number;
  contestCount: number;
  viewerVote: 'confirm' | 'contest' | null | undefined;
}

export function usePlaceEdits(placeId: string) {
  const { data, error, mutate } = useSWR<PlaceEditWithVotes[]>(
    placeId ? `/api/places/${placeId}/edits` : null,
    fetcher,
  );

  const editsByField: Record<string, EditSummary> = {};

  if (data) {
    for (const edit of data) {
      editsByField[edit.fieldName] = {
        id: edit.id,
        newValue: edit.newValue,
        confirmCount: edit.confirmCount,
        contestCount: edit.contestCount,
        viewerVote: edit.viewerVote,
      };
    }
  }

  return {
    editsByField,
    isLoading: !data && !error,
    error,
    refresh: mutate,
  };
}
