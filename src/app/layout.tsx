import type { Metadata } from 'next';
import { LocationProvider } from '@/presentation/contexts/LocationContext';
import { TopBarProvider } from '@/presentation/contexts/TopBarContext';
import { UserProvider } from '@/presentation/contexts/UserContext';
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
      <body className="min-h-dvh bg-bg-subtle antialiased" suppressHydrationWarning>
        <UserProvider>
          <TopBarProvider>
            <LocationProvider>
              <TopBar />
              <div
                id="subheader-root"
                className="fixed left-0 right-0"
                style={{ top: 'var(--topbar-height)', zIndex: 'var(--z-sticky)' }}
              />
              <div
                className="min-h-dvh"
                style={{ paddingTop: 'calc(var(--topbar-height) + var(--subheader-height))' }}
              >
                {children}
              </div>
              <InstallPWA />
              <BottomNav />
            </LocationProvider>
          </TopBarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
