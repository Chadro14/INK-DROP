import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AiChatbot from '@/components/ai/AiChatbot';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

// ✅ METADONNÉES COMPLÈTES AVEC OPEN GRAPH
export const metadata: Metadata = {
  title: 'INKDROP — Plateforme de mangas et animes',
  description: 'La première plateforme manga payée en mobile money.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'INKDROP — Plateforme de mangas et animes',
    description: 'La première plateforme manga payée en mobile money.',
    url: 'https://ink-drop-one.vercel.app',
    siteName: 'INKDROP',
    images: [
      {
        url: 'https://ink-drop-one.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'INKDROP - Plateforme de mangas',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INKDROP — Plateforme de mangas et animes',
    description: 'La première plateforme manga payée en mobile money.',
    images: ['https://ink-drop-one.vercel.app/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
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
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* ✅ ENREGISTREMENT DU SERVICE WORKER */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ Service Worker enregistré avec succès');
                    })
                    .catch(function(error) {
                      console.log('❌ Échec enregistrement Service Worker:', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} min-h-screen flex flex-col bg-black text-white`}>
        <Providers>
          {children}
          <AiChatbot />
        </Providers>
      </body>
    </html>
  );
}