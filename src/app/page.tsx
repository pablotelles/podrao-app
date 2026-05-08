'use client';

import { useState } from 'react';
import { OnboardingScreen } from '@/presentation/components/onboarding';
import { HomeContent } from '@/presentation/components/home/HomeContent';

export default function HomePage() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('podrao_onboarding_seen') === 'true';
    } catch {
      return false;
    }
  });
  const [initialLocation, setInitialLocation] = useState<{ lat: number; lng: number } | null>(null);

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
