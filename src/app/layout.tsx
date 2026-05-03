import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Onde Comer',
  description: 'Descubra lugares para comer perto de você',
  applicationName: 'Onde Comer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
