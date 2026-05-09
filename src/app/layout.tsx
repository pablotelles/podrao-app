import type { Metadata } from 'next';
import { LocationProvider } from '@/presentation/contexts/LocationContext';
import { TopBarProvider } from '@/presentation/contexts/TopBarContext';
import { UserProvider } from '@/presentation/contexts/UserContext';
import { TopBar } from '@/presentation/components/navigation/TopBar';
import { BottomNav } from '@/presentation/components/navigation/BottomNav';
import { InstallPWA } from '@/presentation/components/navigation/InstallPWA';
import { MainLayout } from '@/presentation/components/navigation/MainLayout';
import { ToastProvider } from '@/presentation/components/ui/ToastProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Onde Comer',
  description: 'Descubra lugares para comer perto de você',
  applicationName: 'Onde Comer',
  themeColor: '#5856d6', // Exception: Next.js metadata requires literal string, mirrors --color-brand
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-bg-subtle antialiased" suppressHydrationWarning>
        <UserProvider>
          <TopBarProvider>
            <LocationProvider>
              <ToastProvider>
                <TopBar />
                <div
                  id="subheader-root"
                  className="fixed left-0 right-0"
                  style={{ top: 'var(--topbar-height)', zIndex: 'var(--z-sticky)' }}
                />
                <MainLayout>{children}</MainLayout>
                <InstallPWA />
                <BottomNav />
              </ToastProvider>
            </LocationProvider>
          </TopBarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
