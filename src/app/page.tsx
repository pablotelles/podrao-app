'use client';

import { useState, useLayoutEffect } from 'react';
import { OnboardingScreen } from '@/presentation/components/onboarding';
import { HomeContent } from '@/presentation/components/home/HomeContent';
import { MapSkeleton } from '@/presentation/components/maps/MapSkeleton';

export default function HomePage() {
  // null = ainda não leu sessionStorage (estado desconhecido no servidor)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [initialLocation, setInitialLocation] = useState<{ lat: number; lng: number } | null>(null);

  // useLayoutEffect: roda antes do primeiro paint no cliente → sem flash
  // No servidor não roda, então o estado fica null e nada é renderizado
  useLayoutEffect(() => {
    try {
      setHasSeenOnboarding(sessionStorage.getItem('podrao_onboarding_seen') === 'true');
    } catch {
      setHasSeenOnboarding(false);
    }
  }, []);

  if (hasSeenOnboarding === null) {
    return (
      <div className="relative" style={{ height: 'calc(100dvh - var(--topbar-height))' }}>
        <MapSkeleton />
      </div>
    );
  }

  if (!hasSeenOnboarding) {
    return (
      <OnboardingScreen
        onComplete={(lat, lng) => {
          setInitialLocation({ lat, lng });
          setHasSeenOnboarding(true);
        }}
      />
    );
  }

  return <HomeContent initialLat={initialLocation?.lat} initialLng={initialLocation?.lng} />;
}
