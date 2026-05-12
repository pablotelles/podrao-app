'use client';

import useSWR from 'swr';
import type { PlaceEditWithVotes } from '@/domain/entities/PlaceEdit';

async function fetcher(url: string): Promise<PlaceEditWithVotes[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar fila de edições');
  return res.json() as Promise<PlaceEditWithVotes[]>;
}

export function useAdminEditsQueue() {
  const {
    data: expiredEdits,
    error: expiredError,
    mutate: mutateExpired,
  } = useSWR<PlaceEditWithVotes[]>('/api/admin/edits/queue', fetcher);

  const {
    data: level2Edits,
    error: level2Error,
    mutate: mutateLevel2,
  } = useSWR<PlaceEditWithVotes[]>('/api/admin/edits/queue?type=level2', fetcher);

  const isLoading = (!expiredEdits && !expiredError) || (!level2Edits && !level2Error);
  const error = expiredError ?? level2Error;

  const refresh = async () => {
    await Promise.all([mutateExpired(), mutateLevel2()]);
  };

  return {
    expiredEdits: expiredEdits ?? [],
    level2Edits: level2Edits ?? [],
    isLoading,
    error: error as Error | undefined,
    refresh,
  };
}
