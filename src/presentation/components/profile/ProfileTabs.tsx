'use client';

import { MapPin, Heart, List, Star } from 'lucide-react';
import { Tabs } from '@/presentation/components/ui/Tabs';
import type { TabItem } from '@/presentation/components/ui/Tabs';

export type ProfileTab = 'lugares' | 'favoritos' | 'listas' | 'avaliacoes';

const PROFILE_TABS: TabItem<ProfileTab>[] = [
  { id: 'lugares', label: 'Lugares', icon: <MapPin size={16} /> },
  { id: 'favoritos', label: 'Favoritos', icon: <Heart size={16} /> },
  { id: 'listas', label: 'Listas', icon: <List size={16} /> },
  { id: 'avaliacoes', label: 'Avaliações', icon: <Star size={16} /> },
];

interface ProfileTabsProps {
  children: (activeTab: ProfileTab) => React.ReactNode;
}

export function ProfileTabs({ children }: ProfileTabsProps) {
  return (
    <Tabs tabs={PROFILE_TABS} defaultTab="lugares">
      {children}
    </Tabs>
  );
}
