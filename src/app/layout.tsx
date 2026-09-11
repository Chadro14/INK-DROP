"use client";

import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AiChatbot from '@/components/ai/AiChatbot';
import { SocketProvider } from '@/providers/SocketProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

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

        {/* ✅ SCRIPT ANTI-FLASH */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  var effective = theme;
                  if (theme === 'system') {
                    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (effective === 'light') {
                    document.documentElement.classList.add('light-theme');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* ✅ SERVICE WORKER */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ Service Worker enregistré');
                    })
                    .catch(function(error) {
                      console.log('❌ Service Worker échec:', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} min-h-screen flex flex-col bg-background text-foreground`}>
        <ThemeProvider>       {/* ← TON provider uniquement */}
          <Providers>         {/* ← QueryClient uniquement */}
            <SocketProvider>
              {children}
            </SocketProvider>
            <AiChatbot />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
