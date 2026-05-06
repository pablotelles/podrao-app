import type { Metadata } from 'next';
import { LocationProvider } from '@/presentation/contexts/LocationContext';
import { TopBarProvider } from '@/presentation/contexts/TopBarContext';
import { TopBar } from '@/presentation/components/navigation/TopBar';
import { BottomNav } from '@/presentation/components/navigation/BottomNav';
import { InstallPWA } from '@/presentation/components/navigation/InstallPWA';
import './globals.css';

export const metadata: Metadata = {
  title: 'Onde Comer',
  description: 'Descubra lugares para comer perto de você',
  applicationName: 'Onde Comer',
  themeColor: '#5856d6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <TopBarProvider>
          <LocationProvider>
            <TopBar />
            <div style={{ paddingTop: 'var(--topbar-height)' }}>{children}</div>
            <InstallPWA />
            <BottomNav />
          </LocationProvider>
        </TopBarProvider>
      </body>
    </html>
  );
}
