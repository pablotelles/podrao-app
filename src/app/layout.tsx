import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { LocationProvider } from '@/presentation/contexts/LocationContext';
import { TopBarProvider } from '@/presentation/contexts/TopBarContext';
import { UserProvider } from '@/presentation/contexts/UserContext';
import { TopBar } from '@/presentation/components/navigation/TopBar';
import { BottomNav } from '@/presentation/components/navigation/BottomNav';
import { InstallPWA } from '@/presentation/components/navigation/InstallPWA';
import { MainLayout } from '@/presentation/components/navigation/MainLayout';
import { ToastProvider } from '@/presentation/components/ui/ToastProvider';
import { createServerSupabaseClient } from '@/presentation/lib/api-helpers';
import { userRepository } from '@/presentation/lib/container';
import type { User } from '@/domain/entities/User';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Podrao',
  description: 'Descubra lugares para comer perto de você',
  applicationName: 'Podrao',
  themeColor: '#5856d6', // Exception: Next.js metadata requires literal string, mirrors --color-brand
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
  },
};

async function getInitialUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return await userRepository.findById(user.id);
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await getInitialUser();

  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh bg-bg-subtle antialiased" suppressHydrationWarning>
        <UserProvider initialUser={initialUser}>
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
