'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart, Eye, Clock, Star, TrendingUp, Users, Wallet, Film } from 'lucide-react';
import { BottomNav } from '@/components/layout/bottom-nav';

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

// ============================================
// DONNÉES MOCK (remplacées par API plus tard)
// ============================================
const mockMangas: Manga[] = [
  { id: '1', title: 'Le Dernier Samouraï', coverUrl: '', author: { username: 'K. Makengo' }, likesCount: 12400, viewsCount: 45000, genre: ['Action'], createdAt: new Date().toISOString() },
  { id: '2', title: 'Lune de Sang', coverUrl: '', author: { username: 'S. Diop' }, likesCount: 9800, viewsCount: 32000, genre: ['Horreur'], createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: '3', title: 'Neo Kinshasa', coverUrl: '', author: { username: 'J. Mbemba' }, likesCount: 8200, viewsCount: 28000, genre: ['Sci-Fi'], createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: '4', title: 'Cœurs Brisés', coverUrl: '', author: { username: 'A. Kouamé' }, likesCount: 7500, viewsCount: 22000, genre: ['Romance'], createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
];

const heroImages = [
  { title: 'Le Dernier Samouraï', gradient: 'from-orange-500 to-red-500', emoji: '⚔️' },
  { title: 'Neo Kinshasa', gradient: 'from-blue-500 to-cyan-500', emoji: '🚀' },
  { title: 'Lune de Sang', gradient: 'from-purple-500 to-pink-500', emoji: '🌙' },
];

const creators = [
  { name: 'K. Makengo', initial: 'K', color: 'from-orange-500 to-red-500' },
  { name: 'S. Diop', initial: 'S', color: 'from-purple-500 to-blue-500' },
  { name: 'J. Mbemba', initial: 'J', color: 'from-green-500 to-yellow-500' },
  { name: 'A. Kouamé', initial: 'A', color: 'from-pink-500 to-purple-500' },
  { name: 'P. Nzita', initial: 'P', color: 'from-yellow-500 to-orange-500' },
];

// ============================================
// PAGE PRINCIPALE
// ============================================
export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mangas, setMangas] = useState<Manga[]>(mockMangas);
  const [loading, setLoading] = useState(false);

  // ============================================
  // CARROUSEL AUTOMATIQUE (3s)
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-ink-bg/80 backdrop-blur-sm border-b border-ink-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-sm">
              I
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

      {/* ===== HERO CARROUSEL ===== */}
      <section className="relative overflow-hidden mx-4 mt-4 rounded-2xl">
        <div className="relative aspect-[16/9] bg-ink-card rounded-2xl overflow-hidden border border-ink-border">
          {heroImages.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
                <span className="text-7xl opacity-30">{slide.emoji}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-bg via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-ink-bg to-transparent">
                <p className="text-ink-muted text-xs font-medium mb-1">📖 À la une</p>
                <h2 className="text-xl font-bold">{slide.title}</h2>
                <Link
                  href={`/manga/1`}
                  className="inline-block mt-2 px-4 py-1.5 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-colors"
                >
                  Lire maintenant
                </Link>
              </div>
            </div>
          ))}

          {/* Indicateurs */}
          <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-6 bg-accent' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== TAGLINE ===== */}
      <div className="text-center px-4 py-4">
        <p className="text-ink-muted text-sm font-medium">
          🚀 La première plateforme manga payée en <span className="text-accent">mobile money</span>
        </p>
      </div>

      {/* ===== CRÉATEURS À SUIVRE (STORIES) ===== */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wider">
            ✨ Créateurs à suivre
          </h3>
          <Link href="/discover" className="text-accent text-xs font-medium hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {creators.map((creator, i) => (
            <Link
              key={i}
              href={`/creator/${creator.name.toLowerCase().replace(/\s/g, '')}`}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${creator.color} flex items-center justify-center text-white font-bold text-lg border-2 border-transparent group-hover:border-accent transition-all`}>
                {creator.initial}
              </div>
              <span className="text-ink-muted text-[10px] truncate max-w-14 text-center">
                {creator.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== DERNIERS CHAPITRES ===== */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wider">
            📖 Derniers chapitres
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
                <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-accent/20 to-accent-dark/20 flex-shrink-0 flex items-center justify-center text-2xl">
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{manga.title}</h4>
                  <p className="text-ink-muted text-xs truncate">par {manga.author.username}</p>
                  <div className="flex items-center gap-3 mt-1 text-ink-muted text-[10px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3" /> {manga.likesCount}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> {manga.viewsCount}
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
      <section className="px-4 py-2 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-ink-muted text-xs font-semibold uppercase tracking-wider">
            🏆 Top du mois
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
              <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center text-4xl relative">
                📖
                {index === 0 && (
                  <span className="absolute top-2 left-2 text-xs font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">🏆 1</span>
                )}
                {index === 1 && (
                  <span className="absolute top-2 left-2 text-xs font-bold bg-gray-400/20 text-gray-400 px-2 py-0.5 rounded-full">🥈 2</span>
                )}
                {index === 2 && (
                  <span className="absolute top-2 left-2 text-xs font-bold bg-orange-400/20 text-orange-400 px-2 py-0.5 rounded-full">🥉 3</span>
                )}
              </div>
              <div className="p-2">
                <h4 className="text-sm font-semibold truncate">{manga.title}</h4>
                <p className="text-ink-muted text-[10px] truncate">{manga.author.username}</p>
                <div className="flex items-center gap-2 mt-0.5 text-ink-muted text-[10px]">
                  <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {manga.likesCount}</span>
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