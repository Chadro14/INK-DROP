// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/header'
import MangaCard, { type Manga } from '@/components/manga/manga-card'
import apiClient from '@/lib/api/client'

export default function HomePage() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMangas()
  }, [])

  const loadMangas = async () => {
    try {
      setLoading(true)
      // Données mock en attendant le vrai backend
      const mockMangas: Manga[] = [
        {
          id: '1',
          title: 'Le Dernier Samouraï',
          slug: 'le-dernier-samourai',
          totalLikes: 12400,
          isHot: true,
          creator: { username: 'kenji_art', displayName: 'Kenji Matsuda', isVerified: true },
        },
        {
          id: '2',
          title: 'Lune de Sang',
          slug: 'lune-de-sang',
          totalLikes: 9800,
          isNew: true,
          creator: { username: 'mystique_drc', displayName: 'Luna Mystic' },
        },
        {
          id: '3',
          title: 'Neo Kinshasa',
          slug: 'neo-kinshasa',
          totalLikes: 8200,
          creator: { username: 'sci_fi_cd', displayName: 'NEO' },
        },
        {
          id: '4',
          title: 'Cœurs Brisés',
          slug: 'coeurs-brisés',
          totalLikes: 7500,
          creator: { username: 'romance_cd', displayName: 'Amour DRC' },
        },
        {
          id: '5',
          title: 'Les Esprits de Goma',
          slug: 'esprits-de-goma',
          totalLikes: 6100,
          isNew: true,
          creator: { username: 'goma_studio', displayName: 'Goma Studio' },
        },
        {
          id: '6',
          title: 'Éclair Noir',
          slug: 'eclair-noir',
          totalLikes: 5900,
          isHot: true,
          creator: { username: 'kenji_art', displayName: 'Kenji Matsuda', isVerified: true },
        },
      ]
      setMangas(mockMangas)
      setError(null)
    } catch (err) {
      setError('Impossible de charger les mangas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink-bg">
      <Header />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <span className="inline-block bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full border border-accent/30 mb-6">
          Nouveau — Beta RDC ouverte
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-4 gradient-text">
          Lis. Kiff. Soutiens
          <br />
          tes dessinateurs.
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-xl mx-auto mb-8">
          La première plateforme manga où chaque dessinateur congolais, ivoirien, sénégalais...
          est payé en mobile money en quelques secondes.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/discover"
            className="gradient-accent text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            Commencer à lire
          </Link>
          <Link
            href="/creator/upload"
            className="border border-ink-border text-white font-semibold px-6 py-3 rounded-lg hover:border-accent hover:text-accent transition"
          >
            Publier mon manga
          </Link>
        </div>
      </section>

      {/* TRENDING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Tendance cette semaine</h2>
          <Link href="/discover" className="text-accent text-sm font-medium hover:underline">
            Voir tout →
          </Link>
        </div>

        {loading && (
          <div className="text-center text-ink-muted py-12">Chargement des mangas...</div>
        )}

        {error && (
          <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Pourquoi INKDROP ?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
              ),
              title: 'Paiement mobile money',
              desc: 'M-Pesa, Airtel, Orange, MTN — débloque un chapitre en quelques secondes.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                </svg>
              ),
              title: '70% pour les créateurs',
              desc: 'Les dessinateurs reçoivent l\'argent directement sur leur mobile money.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
              ),
              title: 'Programme Movie Box',
              desc: 'Les meilleurs mangas sont pitchés aux studios d\'animation.',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-ink-card border border-ink-border rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-ink-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-border mt-16 py-8 text-center text-sm text-ink-muted">
        © 2025 INKDROP — Fait avec passion à Kinshasa
      </footer>
    </main>
  )
}