'use client';

import { useState } from 'react';
import { MapPin, Star, ListCollapse, Loader2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { AddressAutocomplete } from '@/presentation/components/ui/AddressAutocomplete';
import { useHideBottomNav, useHideTopBar } from '@/presentation/contexts/TopBarContext';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';

const SESSION_KEY = 'podrao_onboarding_seen';

function persistSeen() {
  try {
    localStorage.setItem(SESSION_KEY, 'true');
  } catch {}
}

const VALUE_PROPS = [
  {
    Icon: MapPin,
    title: 'Mapa de fome inteligente',
    subtitle: 'Descubra restaurantes e lanchonetes na sua região',
  },
  {
    Icon: Star,
    title: 'Quem foi lá conta a verdade',
    subtitle: 'Avaliações honestas de quem já comeu lá',
  },
  {
    Icon: ListCollapse,
    title: 'Rotas de comida feitas por quem entende',
    subtitle: 'Descubra rotas de food criadas por usuários',
  },
];

interface OnboardingScreenProps {
  onComplete: (lat: number, lng: number) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  useHideBottomNav();
  useHideTopBar();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<AutocompleteResult | null>(null);

  function handleGpsClick() {
    if (!navigator.geolocation) {
      setGpsDenied(true);
      return;
    }
    setGpsLoading(true);
    setGpsDenied(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        persistSeen();
        onComplete(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGpsLoading(false);
        setGpsDenied(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handlePlaceSelect(result: AutocompleteResult) {
    setSelectedPlace(result);
    persistSeen();
    onComplete(result.lat, result.lng);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Hero ── */}
      <div
        className="relative flex shrink-0 flex-col items-center justify-center overflow-hidden"
        style={{
          height: '360px',
          background: 'linear-gradient(160deg, #3b39b0 0%, var(--color-brand) 50%, #7c7be0 100%)',
        }}
      >
        {/* Map grid */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.12]"
          viewBox="0 0 390 360"
          aria-hidden="true"
        >
          <g stroke="white" strokeWidth="1" fill="none">
            <line x1="0" y1="80" x2="390" y2="80" />
            <line x1="0" y1="160" x2="390" y2="160" />
            <line x1="0" y1="240" x2="390" y2="240" />
            <line x1="0" y1="320" x2="390" y2="320" />
            <line x1="70" y1="0" x2="70" y2="360" />
            <line x1="160" y1="0" x2="160" y2="360" />
            <line x1="250" y1="0" x2="250" y2="360" />
            <line x1="330" y1="0" x2="330" y2="360" />
            <line x1="0" y1="0" x2="390" y2="360" strokeDasharray="20 10" />
          </g>
        </svg>

        {/* Location pings */}
        <span className="absolute left-15 top-20 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white/80" />
        </span>
        <span className="absolute right-12.5 top-40 flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60"
            style={{ animationDelay: '0.6s' }}
          />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white/80" />
        </span>
        <span className="absolute bottom-15 left-25 flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60"
            style={{ animationDelay: '1.2s' }}
          />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white/80" />
        </span>

        {/* Floating card — place */}
        <div className="absolute left-5 top-7.5 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-text-primary shadow-(--shadow-modal)">
          <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
          Caldeirão da Vó · 0,3 km
        </div>

        {/* Floating card — rating */}
        <div className="absolute right-4 top-45 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-text-primary shadow-(--shadow-modal)">
          <span className="text-warning">★</span>
          4.8 · 142 avaliações
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center gap-3 px-5 text-center">
          <span className="animate-bounce text-5xl" role="img" aria-label="comida">
            🍽️
          </span>
          <h1 className="max-w-65 text-[1.75rem] font-extrabold leading-tight tracking-tight text-white">
            Comida boa, perto de você
          </h1>
          <p className="max-w-60 text-sm leading-snug text-white/85">
            Recomendações da comunidade. Preços reais. Sem papo furado.
          </p>
        </div>
      </div>

      {/* ── Bottom sheet ── */}
      <div className="flex flex-1 flex-col gap-4 bg-bg px-(--spacing-page-x) py-6">
        {/* Value props */}
        <div className="flex flex-col gap-3">
          {VALUE_PROPS.map(({ Icon, title, subtitle }) => (
            <Card key={title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-brand">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{title}</p>
                <p className="text-xs text-text-secondary">{subtitle}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* GPS CTA */}
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleGpsClick}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Localizando...
              </>
            ) : gpsDenied ? (
              'GPS negado — tente novamente'
            ) : (
              'Usar minha localização'
            )}
          </Button>
          {gpsDenied && (
            <p className="text-center text-sm text-warning">
              Permissão negada. Busque seu bairro ou cidade abaixo.
            </p>
          )}
        </div>

        {/* Divider */}
        <p className="text-center text-sm font-medium text-text-secondary">
          Ou busque seu bairro ou cidade
        </p>

        {/* Address search */}
        <AddressAutocomplete
          selected={selectedPlace}
          onSelect={handlePlaceSelect}
          onClear={() => setSelectedPlace(null)}
          placeholder="São Paulo, Vila Madalena, etc..."
        />

        <p className="mt-auto pt-4 text-center text-xs text-text-secondary">Podrao &copy; 2026</p>
      </div>
    </div>
  );
}
