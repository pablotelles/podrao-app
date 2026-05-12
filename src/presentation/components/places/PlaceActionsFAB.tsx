'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, ThumbsUp, MapPin } from 'lucide-react';
import { useUser } from '@/presentation/contexts/UserContext';
import { usePlaceVisits } from '@/presentation/hooks/usePlaceVisits';
import { useToast } from '@/presentation/hooks/useToast';
import { FAB } from '@/presentation/components/ui/FAB';
import { Sheet } from '@/presentation/components/ui/Sheet';
import { RadioListItem } from '@/presentation/components/ui/RadioListItem';
import { SuggestEditSheet } from '@/presentation/components/place/SuggestEditSheet';
import type { SuggestEditSheetProps } from '@/presentation/components/place/SuggestEditSheet';
import type { VisitRecency } from '@/domain/value-objects/VisitRecency';

const RECENCY_OPTIONS: { value: VisitRecency; label: string; description: string }[] = [
  { value: 'today', label: 'Hoje', description: 'Estive aqui hoje' },
  { value: 'this_week', label: 'Essa semana', description: 'Fui nessa semana' },
  { value: 'a_while_ago', label: 'Faz um tempo', description: 'Já fui, mas faz um tempo' },
];

interface PlaceActionsFABProps {
  placeId: string;
  slug?: string | null;
  isApproved: boolean;
  canReview: boolean;
  initialVisitCount: number;
  initialVisitedToday: boolean;
  place: SuggestEditSheetProps['place'];
  pendingEditsByField: Record<string, { id: string }>;
}

export function PlaceActionsFAB({
  placeId,
  slug,
  isApproved,
  canReview,
  initialVisitCount,
  initialVisitedToday,
  place,
  pendingEditsByField,
}: PlaceActionsFABProps) {
  const { user } = useUser();
  const router = useRouter();
  const { showToast } = useToast();
  const { viewerVisitCount, viewerVisitedToday, mutate } = usePlaceVisits(placeId);

  const [editOpen, setEditOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [selectedRecency, setSelectedRecency] = useState<VisitRecency | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState(false);

  const visitCount = viewerVisitCount ?? initialVisitCount;
  const visitedToday = viewerVisitedToday ?? initialVisitedToday;

  const handleReview = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(slug ? `/p/${slug}/review` : `/places/${placeId}/review`);
  };

  const handleCheckin = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setCheckinError(false);
    setSelectedRecency(null);
    setCheckinOpen(true);
  };

  const handleConfirmCheckin = async () => {
    if (!selectedRecency || checkinLoading) return;
    const countBefore = visitCount;
    setCheckinLoading(true);
    try {
      const res = await fetch(`/api/places/${placeId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recency: selectedRecency }),
      });
      if (!res.ok) throw new Error();
      setCheckinOpen(false);
      await mutate();
      router.refresh();
      const newCount = countBefore + 1;
      const timesStr = newCount === 1 ? '1 vez' : `${newCount} vezes`;
      showToast({
        type: 'success',
        title: 'Check-in registrado!',
        message:
          countBefore === 0
            ? 'Primeira visita registrada. Obrigado por contribuir!'
            : `Visita registrada. Você já foi ${timesStr} aqui.`,
        duration: 4000,
      });
    } catch {
      setCheckinError(true);
    } finally {
      setCheckinLoading(false);
    }
  };

  const actions = [
    { icon: Pencil, label: 'Sugerir mudança', onClick: () => setEditOpen(true) },
    ...(canReview ? [{ icon: ThumbsUp, label: 'Fazer avaliação', onClick: handleReview }] : []),
    ...(isApproved && !visitedToday
      ? [{ icon: MapPin, label: 'Estive aqui', onClick: handleCheckin }]
      : []),
  ];

  return (
    <>
      <FAB actions={actions} aria-label="Ações do lugar" />

      <Sheet
        open={checkinOpen}
        onClose={() => setCheckinOpen(false)}
        title="Quando você foi?"
        footer={
          <div className="px-(--spacing-page-x) pb-8 pt-3">
            <button
              type="button"
              onClick={handleConfirmCheckin}
              disabled={!selectedRecency || checkinLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-text-inverse shadow-(--shadow-fab) transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-40"
            >
              {checkinLoading ? 'Registrando...' : 'Confirmar check-in'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col">
          {RECENCY_OPTIONS.map((opt) => (
            <RadioListItem
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={selectedRecency === opt.value}
              onSelect={() => {
                setSelectedRecency(opt.value);
                setCheckinError(false);
              }}
            />
          ))}
          {checkinError && (
            <p
              className="px-(--spacing-page-x) pt-2 text-(--font-size-label)"
              style={{ color: 'var(--color-error)' }}
            >
              Não foi possível registrar — tente novamente
            </p>
          )}
        </div>
      </Sheet>

      <SuggestEditSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        place={place}
        pendingEditsByField={pendingEditsByField}
        placeId={placeId}
      />
    </>
  );
}
