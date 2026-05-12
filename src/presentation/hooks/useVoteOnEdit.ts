'use client';

import { useState } from 'react';

type VoteType = 'confirm' | 'contest';

interface UseVoteOnEditReturn {
  submitVote: (voteType: VoteType) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useVoteOnEdit(editId: string, onSuccess?: () => void): UseVoteOnEditReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVote = async (voteType: VoteType): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/edits/${editId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { code?: string; error?: string };
        if (body.code === 'EDIT_SELF_VOTE') {
          setError('EDIT_SELF_VOTE');
        } else if (body.code === 'EDIT_DUPLICATE_VOTE') {
          setError('EDIT_DUPLICATE_VOTE');
        } else if (res.status === 401) {
          setError('UNAUTHORIZED');
        } else {
          setError(body.error ?? 'Erro ao registrar voto');
        }
        return;
      }

      onSuccess?.();
    } catch {
      setError('Erro ao registrar voto');
    } finally {
      setIsLoading(false);
    }
  };

  return { submitVote, isLoading, error };
}
