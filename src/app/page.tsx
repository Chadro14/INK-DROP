'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Heart, Eye, Clock, Star, Users, BookOpen, TrendingUp, Award } from 'lucide-react';

// ============================================
// SVG ICONS PERSONNALISÉS (100% SVG)
// ============================================
const IconLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <path d="M8 8h8v8H8z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconManga = () => (
  <svg className="w-8 h-8 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="7" y1="7" x2="17" y2="7" />
    <line x1="7" y1="11" x2="17" y2="11" />
    <line x1="7" y1="15" x2="13" y2="15" />
  </svg>
);

const IconTrophy = () => (
  <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9H4a2 2 0 0 1-2-2V5h4v4Z" />
    <path d="M18 9h2a2 2 0 0 0 2-2V5h-4v4Z" />
    <path d="M6 15h12v2a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-2Z" />
    <path d="M12 3v12" />
  </svg>
);

// ============================================
// TYPES
// ============================================
type Manga = {
  id: string;
  title: string;
  coverUrl: string;
  author: { username: string };
  likesCount: number;
  viewsCount: number;
  genre: string[];
  createdAt: string;
};

type Creator = {
  id: string;
  username: string;
  avatarUrl: string;
  isCertified: boolean;
  _count: { mangas: number; followers: number };
};

// ============================================
// PAGE
// ============================================
export default function Home() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const [mangasRes, creatorsRes] = await Promise.all([
          fetch(`${baseUrl}/mangas/top?limit=6`),
          fetch(`${baseUrl}/users/top-creators?limit=5`),
        ]);
        const mangasData = await mangasRes.json();
        const creatorsData = await creatorsRes.json();
        setMangas(mangasData.data || []);
        setCreators(creatorsData.data || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-ink-bg">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-ink-bg/80 backdrop-blur-sm border-b border-ink-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-sm">
              <IconLogo />
            </div>
            <span className="text-lg font-bold">
              INK<span className="text-accent">DROP</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-ink-muted hover:text-ink-text transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button className="text-ink-muted hover:text-ink-text transition-colors relative">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[10px] text-white flex items-center justify-center font-bold">3</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== TAGLINE ===== */}
      <div className="text-center px-4 py-4 border-b border-ink-border">
        <p className="text-ink-muted text-sm font-medium flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          La première plateforme manga payée en <span className="text-accent">mobile money</span>
        </p>
      </div>

      {/* ===== CRÉATEURS À SUIVRE ===== */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Créateurs à suivre
          </h3>
          <Link href="/discover" className="text-accent text-xs font-medium hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {creators.map((creator) => (
            <Link
              key={creator.id}
              href={`/creator/${creator.username}`}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center text-ink-text font-bold text-lg border-2 border-transparent group-hover:border-accent transition-all relative">
                {creator.username.charAt(0).toUpperCase()}
                {creator.isCertified && (
                  <span className="absolute -top-0.5 -right-0.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </span>
                )}
              </div>
              <span className="text-ink-muted text-[10px] truncate max-w-14 text-center">
                {creator.username}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== DERNIERS CHAPITRES ===== */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Derniers chapitres
          </h3>
          <Link href="/discover" className="text-accent text-xs font-medium hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="space-y-3">
          {mangas.slice(0, 3).map((manga) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="block bg-ink-card border border-ink-border rounded-xl p-3 hover:border-accent transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-accent/20 to-accent-dark/20 flex-shrink-0 flex items-center justify-center">
                  <IconManga />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{manga.title}</h4>
                  <p className="text-ink-muted text-xs truncate">par {manga.author?.username || 'Inconnu'}</p>
                  <div className="flex items-center gap-3 mt-1 text-ink-muted text-[10px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3" /> {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> {manga.viewsCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> 2h
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold hover:bg-accent/20 transition-colors">
                  Lire
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TOP MANGA ===== */}
      <section className="px-4 py-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            Top du mois
          </h3>
          <Link href="/discover" className="text-accent text-xs font-medium hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mangas.slice(0, 4).map((manga, index) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="bg-ink-card border border-ink-border rounded-xl overflow-hidden hover:border-accent transition-all active:scale-[0.97]"
            >
              <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center relative">
                <IconManga />
                {index === 0 && (
                  <span className="absolute top-2 left-2 flex items-center gap-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                    <IconTrophy /> 1
                  </span>
                )}
                {index === 1 && (
                  <span className="absolute top-2 left-2 text-xs font-bold bg-gray-400/20 text-gray-400 px-2 py-0.5 rounded-full">
                    <span className="flex items-center gap-0.5">🥈 2</span>
                  </span>
                )}
                {index === 2 && (
                  <span className="absolute top-2 left-2 text-xs font-bold bg-orange-400/20 text-orange-400 px-2 py-0.5 rounded-full">
                    <span className="flex items-center gap-0.5">🥉 3</span>
                  </span>
                )}
              </div>
              <div className="p-2">
                <h4 className="text-sm font-semibold truncate">{manga.title}</h4>
                <p className="text-ink-muted text-[10px] truncate">{manga.author?.username || 'Inconnu'}</p>
                <div className="flex items-center gap-2 mt-0.5 text-ink-muted text-[10px]">
                  <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {manga.likesCount || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <BottomNav />

    </div>
  );
}