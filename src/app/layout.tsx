import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'INKDROP — Plateforme de mangas et animes',
  description: 'La première plateforme manga payée en mobile money. Lisez, publiez et soutenez vos créateurs préférés.',
  keywords: 'manga, anime, mobile money, plateforme manga, dessinateurs, lecture manga',
  openGraph: {
    title: 'INKDROP — Plateforme de mangas et animes',
    description: 'La première plateforme manga payée en mobile money.',
    url: 'https://inkdrop-xi.netlify.app',
    siteName: 'INKDROP',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INKDROP — Plateforme de mangas et animes',
    description: 'La première plateforme manga payée en mobile money.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#0A1628" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${outfit.variable} min-h-screen flex flex-col`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}