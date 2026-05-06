'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/presentation/contexts/UserContext';

interface UseReactionOptions {
  entityType: string;
  entityId: string;
  type?: string;
  initialCount?: number;
  initialActive?: boolean;
}

export function useReaction({
  entityType,
  entityId,
  type = 'useful',
  initialCount = 0,
  initialActive = false,
}: UseReactionOptions) {
  const { user } = useUser();
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic update
    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => (wasActive ? c - 1 : c + 1));
    setLoading(true);

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, type }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { active: boolean; count: number };
      setActive(data.active);
      setCount(data.count);
    } catch {
      // Rollback
      setActive(wasActive);
      setCount((c) => (wasActive ? c + 1 : c - 1));
    } finally {
      setLoading(false);
    }
  };

  return { count, active, toggle, loading };
}
