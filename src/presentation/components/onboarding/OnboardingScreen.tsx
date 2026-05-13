'use client';

import { useState } from 'react';
import { MapPin, Star, ListCollapse, Loader2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { AddressAutocomplete } from '@/presentation/components/ui/AddressAutocomplete';
import { Text } from '@/presentation/components/ui/Text';
import { useHideBottomNav, useHideTopBar } from '@/presentation/contexts/TopBarContext';
import type { AutocompleteResult } from '@/domain/interfaces/IMapProvider';

async function persistSeen() {
  try {
    await fetch('/api/onboarding/seen', { method: 'POST' });
  } catch {
    // degradação graciosa — próxima visita verá onboarding de novo
  }
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
        void persistSeen().then(() => {
          onComplete(pos.coords.latitude, pos.coords.longitude);
        });
      },
      () => {
        setGpsLoading(false);
        setGpsDenied(true);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handlePlaceSelect(result: AutocompleteResult) {
    setSelectedPlace(result);
    await persistSeen();
    onComplete(result.lat, result.lng);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── Hero ── */}
      <div
        className="relative flex shrink-0 flex-col items-center justify-center overflow-hidden"
        style={{
          height: '360px',
          background:
            'linear-gradient(160deg, var(--color-brand-dark) 0%, var(--color-brand) 50%, var(--color-brand-light) 100%)',
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
        <div className="absolute left-5 top-7.5 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 shadow-(--shadow-modal)">
          <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
          <Text as="span" variant="label">
            Caldeirão da Vó · 0,3 km
          </Text>
        </div>

        {/* Floating card — rating */}
        <div className="absolute right-4 top-45 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 shadow-(--shadow-modal)">
          <span className="text-warning">★</span>
          <Text as="span" variant="label">
            4.8 · 142 avaliações
          </Text>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center gap-3 px-5 text-center">
          <span className="animate-bounce text-5xl" role="img" aria-label="comida">
            🍽️
          </span>
          <Text
            as="h1"
            variant="display"
            className="max-w-65 text-(--font-size-display-lg) leading-tight tracking-tight"
            style={{ color: 'white' }}
          >
            Comida boa, perto de você
          </Text>
          <Text
            as="p"
            variant="body"
            className="max-w-60 leading-snug"
            style={{ color: 'var(--color-text-inverse-muted)' }}
          >
            Recomendações da comunidade. Preços reais. Sem papo furado.
          </Text>
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
                <Text as="p" variant="label">
                  {title}
                </Text>
                <Text as="p" variant="caption" textColor="secondary">
                  {subtitle}
                </Text>
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
            <Text as="p" variant="body" textColor="warning" className="text-center">
              Permissão negada. Busque seu bairro ou cidade abaixo.
            </Text>
          )}
        </div>

        {/* Divider */}
        <Text as="p" variant="label" textColor="secondary" className="text-center">
          Ou busque seu bairro ou cidade
        </Text>

        {/* Address search */}
        <AddressAutocomplete
          selected={selectedPlace}
          onSelect={handlePlaceSelect}
          onClear={() => setSelectedPlace(null)}
          placeholder="São Paulo, Vila Madalena, etc..."
        />

        <Text as="p" variant="caption" textColor="secondary" className="mt-auto pt-4 text-center">
          Podrao &copy; 2026
        </Text>
      </div>
    </div>
  );
}
