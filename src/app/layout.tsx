import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'INKDROP — Plateforme de mangas et animes',
  description: 'La plateforme de mangas et animes. Lis, kiff, soutiens tes dessinateurs.',
  manifest: '/manifest.json',
  themeColor: '#0A0A0A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${outfit.variable} min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}