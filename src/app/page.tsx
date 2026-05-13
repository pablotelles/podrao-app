import { cookies } from 'next/headers';
import { ONBOARDING_COOKIE } from '@/presentation/lib/server/onboarding-cookie';
import {
  getFeaturedListsCached,
  FEATURED_LISTS_LIMIT,
} from '@/presentation/lib/server/featured-lists';
import { HomeContent } from '@/presentation/components/home/HomeContent';
import { OnboardingWrapper } from '@/app/_components/OnboardingWrapper';

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSeenOnboarding = cookieStore.get(ONBOARDING_COOKIE)?.value === 'true';

  if (!hasSeenOnboarding) {
    return <OnboardingWrapper />;
  }

  const featuredLists = await getFeaturedListsCached(FEATURED_LISTS_LIMIT).catch(() => []);

  return <HomeContent initialFeaturedLists={featuredLists} />;
}
