import type { Metadata } from 'next';
import { LocationProvider } from '@/presentation/contexts/LocationContext';
import { BottomNav } from '@/presentation/components/navigation/BottomNav';
import { InstallPWA } from '@/presentation/components/navigation/InstallPWA';
import './globals.css';

export const metadata: Metadata = {
  title: 'Onde Comer',
  description: 'Descubra lugares para comer perto de você',
  applicationName: 'Onde Comer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <LocationProvider>
          {children}
          <InstallPWA />
          <BottomNav />
        </LocationProvider>
      </body>
    </html>
  );
}
