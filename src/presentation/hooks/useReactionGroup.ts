'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/presentation/contexts/UserContext';

interface UseReactionGroupOptions {
  entityType: string;
  entityId: string;
  initialCounts?: Record<string, number>;
  initialActiveType?: string | null;
}

export function useReactionGroup({
  entityType,
  entityId,
  initialCounts = {},
  initialActiveType = null,
}: UseReactionGroupOptions) {
  const { user } = useUser();
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [activeType, setActiveType] = useState<string | null>(initialActiveType ?? null);
  const [loading, setLoading] = useState(false);

  const toggle = async (type: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const prevCounts = counts;
    const prevActive = activeType;

    // Optimistic update — exclusividade mútua
    const newCounts = { ...counts };
    if (activeType && activeType !== type) {
      newCounts[activeType] = Math.max(0, (newCounts[activeType] ?? 0) - 1);
    }
    if (activeType === type) {
      newCounts[type] = Math.max(0, (newCounts[type] ?? 0) - 1);
      setActiveType(null);
    } else {
      newCounts[type] = (newCounts[type] ?? 0) + 1;
      setActiveType(type);
    }
    setCounts(newCounts);
    setLoading(true);

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, type }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as {
        active: boolean;
        counts: Record<string, number>;
      };
      setCounts(data.counts);
      setActiveType(data.active ? type : null);
    } catch {
      // Rollback
      setCounts(prevCounts);
      setActiveType(prevActive);
    } finally {
      setLoading(false);
    }
  };

  return { counts, activeType, toggle, loading };
}
