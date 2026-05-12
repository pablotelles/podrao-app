'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CheckCircle } from 'lucide-react';
import { Sheet } from '@/presentation/components/ui/Sheet';
import { RadioListItem } from '@/presentation/components/ui/RadioListItem';
import { useUser } from '@/presentation/contexts/UserContext';
import { usePlaceVisits } from '@/presentation/hooks/usePlaceVisits';
import { useToast } from '@/presentation/hooks/useToast';
import type { VisitRecency } from '@/domain/value-objects/VisitRecency';

const RECENCY_OPTIONS: { value: VisitRecency; label: string; description: string }[] = [
  { value: 'today', label: 'Hoje', description: 'Estive aqui hoje' },
  { value: 'this_week', label: 'Essa semana', description: 'Fui nessa semana' },
  { value: 'a_while_ago', label: 'Faz um tempo', description: 'Já fui, mas faz um tempo' },
];

function formatLastVisit(isoString: string | null): string | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visitDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysAgo = Math.round((today.getTime() - visitDay.getTime()) / 86_400_000);
  if (daysAgo === 0) return 'hoje';
  if (daysAgo === 1) return 'há 1 dia';
  if (daysAgo < 7) return `há ${daysAgo} dias`;
  if (daysAgo < 14) return 'há 1 semana';
  return `há ${Math.round(daysAgo / 7)} semanas`;
}

interface PlaceCheckInButtonProps {
  placeId: string;
  initialVisitCount: number;
  initialVisitedToday: boolean;
  onVisitRegistered?: () => void;
}

export function PlaceCheckInButton({
  placeId,
  initialVisitCount,
  initialVisitedToday,
  onVisitRegistered,
}: PlaceCheckInButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const { showToast } = useToast();
  const { viewerVisitCount, viewerVisitedToday, viewerLastVisitedAt, mutate } =
    usePlaceVisits(placeId);

  // Prefer live SWR data; fall back to SSR initial values
  const visitCount = viewerVisitCount || initialVisitCount;
  const visitedToday = viewerVisitedToday || initialVisitedToday;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRecency, setSelectedRecency] = useState<VisitRecency | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // --- Derive display state ---
  type CheckInState = 'unauthenticated' | 'never-been' | 'been-today' | 'been-before' | 'regular';

  const state: CheckInState = (() => {
    if (!user) return 'unauthenticated';
    if (visitedToday) return 'been-today';
    if (visitCount >= 5) return 'regular';
    if (visitCount > 0) return 'been-before';
    return 'never-been';
  })();

  const isTappable = state !== 'been-today';

  const label =
    state === 'been-today'
      ? 'Você foi hoje'
      : state === 'been-before' || state === 'regular'
        ? 'Fui de novo'
        : 'Estive aqui';

  const personalData = (() => {
    if (state === 'never-been' || state === 'unauthenticated') return null;
    const countStr = visitCount === 1 ? '1 vez' : `${visitCount} vezes`;
    const lastVisitStr = viewerLastVisitedAt
      ? formatLastVisit(viewerLastVisitedAt)
      : visitedToday
        ? 'hoje'
        : null;
    const lastPart = lastVisitStr ? ` · última visita ${lastVisitStr}` : '';
    const frequentador = state === 'regular' ? ' · frequentador' : '';
    return `Você foi ${countStr}${frequentador}${lastPart}`;
  })();

  // --- Handlers ---
  const handleButtonClick = () => {
    if (!isTappable) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setSheetOpen(true);
  };

  const handleClose = () => {
    setSheetOpen(false);
    setSelectedRecency(null);
    setError(false);
  };

  const handleConfirm = async () => {
    if (!selectedRecency || loading) return;
    const countBefore = visitCount;
    setLoading(true);
    try {
      const res = await fetch(`/api/places/${placeId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recency: selectedRecency }),
      });
      if (!res.ok) throw new Error('Erro ao registrar check-in');

      handleClose();
      await mutate();
      onVisitRegistered?.();
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
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // --- Styles per state ---
  const btnStyle: React.CSSProperties =
    state === 'been-today'
      ? {
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          borderColor: 'var(--color-success-border)',
          borderWidth: '1.5px',
          borderStyle: 'solid',
        }
      : state === 'been-before' || state === 'regular'
        ? {
            color: 'var(--color-success)',
            borderColor: 'var(--color-success-border)',
            borderWidth: '1.5px',
            borderStyle: 'solid',
          }
        : {};

  const btnBase =
    'inline-flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

  const btnIdle =
    'border border-brand-border-subtle text-brand hover:bg-brand-subtle hover:border-brand';

  return (
    <>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={!isTappable}
          className={[
            btnBase,
            state === 'never-been' || state === 'unauthenticated'
              ? btnIdle
              : 'cursor-default disabled:cursor-default',
          ].join(' ')}
          style={btnStyle}
        >
          {state === 'been-today' ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <MapPin className="h-4 w-4 shrink-0" />
          )}
          {loading ? 'Registrando...' : label}
        </button>

        {personalData && (
          <p
            className="text-center"
            style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}
          >
            {personalData}
          </p>
        )}
      </div>

      <Sheet
        open={sheetOpen}
        onClose={handleClose}
        title="Quando você foi?"
        footer={
          <div className="px-(--spacing-page-x) pb-8 pt-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedRecency || loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-text-inverse shadow-(--shadow-fab) transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {loading ? 'Registrando...' : 'Confirmar check-in'}
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
                setError(false);
              }}
            />
          ))}
          {error && (
            <p
              className="px-(--spacing-page-x) pt-2 text-(--font-size-label)"
              style={{ color: 'var(--color-error)' }}
            >
              Não foi possível registrar — tente novamente
            </p>
          )}
        </div>
      </Sheet>
    </>
  );
}
