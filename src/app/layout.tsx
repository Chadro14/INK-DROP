"use client";

import { useEffect, useState } from "react";
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AiChatbot from '@/components/ai/AiChatbot';
import { SocketProvider } from '@/providers/SocketProvider';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

const API_URL = "https://ink-backend.vercel.app";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accentColor, setAccentColor] = useState("#f97316");

  // ===== CHARGER LA COULEUR AU DÉMARRAGE =====
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erreur chargement utilisateur");
          return res.json();
        })
        .then((data) => {
          // ✅ Appliquer le thème (clair/sombre)
          if (data.preferences?.theme) {
            const root = document.documentElement;
            if (data.preferences.theme === "light") {
              root.classList.add("light-theme");
            } else {
              root.classList.remove("light-theme");
            }
          }

          // ✅ Appliquer la couleur primaire
          if (data.preferences?.accentColor) {
            const color = data.preferences.accentColor;
            setAccentColor(color);
            document.documentElement.style.setProperty("--primary", color);
          }
        })
        .catch((error) => {
          console.error("❌ Erreur chargement des préférences:", error);
        });
    }
  }, []);

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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
        <Providers>
          <SocketProvider>
            {children}
          </SocketProvider>
          <AiChatbot />
        </Providers>
      </body>
    </html>
  );
}
