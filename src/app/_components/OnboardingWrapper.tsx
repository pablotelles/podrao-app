'use client';

import { useRouter } from 'next/navigation';
import { OnboardingScreen } from '@/presentation/components/onboarding';

export function OnboardingWrapper() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleComplete(_lat: number, _lng: number) {
    // Cookie já foi setado dentro do OnboardingScreen via /api/onboarding/seen.
    // Forçamos o servidor a re-renderizar a página com o cookie presente.
    router.refresh();
  }

  return <OnboardingScreen onComplete={handleComplete} />;
}
