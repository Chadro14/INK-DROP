"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  ChevronRight,
  Heart,
  Eye,
  Star,
  Zap,
  Clock
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// ✅ 3 IMAGES POUR LE CARROUSEL
const HERO_IMAGES = [
  "https://files.catbox.moe/qrod9y.jpg",
  "https://files.catbox.moe/iacwbr.jpg",
  "https://files.catbox.moe/2sfji0.jpg",
];

type Manga = {
  id: string;
  title: string;
  coverUrl: string;
  author: { username: string };
  likesCount: number;
  viewsCount: number;
  genre: string[];
};

type Creator = {
  id: string;
  username: string;
  avatarUrl: string;
  isCertified: boolean;
  _count: { mangas: number; followers: number };
};

export default function Home() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ CARROUSEL AUTO (4 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ink-backend.vercel.app";
        const [mangasRes, creatorsRes] = await Promise.all([
          fetch(`${baseUrl}/mangas/top?limit=6`),
          fetch(`${baseUrl}/users/top-creators?limit=5`),
        ]);
        const mangasData = await mangasRes.json();
        const creatorsData = await creatorsRes.json();
        setMangas(mangasData.data || []);
        setCreators(creatorsData.data || []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/discover?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const trendingMangas = mangas.slice(0, 5);
  const topMangas = mangas.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-black text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-xl font-bold text-white">INKDROP</span>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {showSearch && (
          <form onSubmit={handleSearch} className="mt-3 flex items-center gap-2 animate-fade-in">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un manga..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-white outline-none transition-colors"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-colors"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </form>
        )}
      </header>

      {/* ===== CARROUSEL 3 IMAGES (4s) ===== */}
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-[16/9] bg-black">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url('${image}')` }}
            />
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Indicateurs */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {HERO_IMAGES.map((_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== TAGLINE ===== */}
      <div className="text-center px-4 py-4 border-b border-white/5">
        <p className="text-white/40 text-sm font-medium flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4 text-white/60" />
          La première plateforme manga payée en mobile money
        </p>
      </div>

      {/* ===== CRÉATEURS À SUIVRE ===== */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-white/60" />
            Créateurs à suivre
          </h3>
          <Link href="/discover" className="text-white/60 text-xs font-medium hover:text-white transition-colors">
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
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white font-bold text-lg border border-white/10 group-hover:border-white/40 transition-all relative">
                {creator.username?.charAt(0).toUpperCase() || "?"}
                {creator.isCertified && (
                  <span className="absolute -top-0.5 -right-0.5">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </span>
                )}
              </div>
              <span className="text-white/40 text-[10px] truncate max-w-14 text-center">
                {creator.username || "Inconnu"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== DERNIERS CHAPITRES ===== */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-white/60" />
            Derniers chapitres
          </h3>
          <Link href="/discover" className="text-white/60 text-xs font-medium hover:text-white transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="space-y-3">
          {trendingMangas.slice(0, 3).map((manga) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="block bg-white/5 border border-white/10 rounded-xl p-3 hover:border-white/30 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-20 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate text-white">{manga.title || "Sans titre"}</h4>
                  <p className="text-white/40 text-xs truncate">par {manga.author?.username || "Inconnu"}</p>
                  <div className="flex items-center gap-3 mt-1 text-white/40 text-[10px]">
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
                <button className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-semibold hover:bg-white/20 transition-colors">
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
          <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-white/60" />
            Top du mois
          </h3>
          <Link href="/discover" className="text-white/60 text-xs font-medium hover:text-white transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {topMangas.map((manga, index) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all active:scale-[0.97]"
            >
              <div className="aspect-[2/3] bg-white/5 flex items-center justify-center relative">
                <BookOpen className="w-8 h-8 text-white/20" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-white">
                    #{index + 1}
                  </span>
                </div>
              </div>
              <div className="p-2">
                <h4 className="text-sm font-semibold truncate text-white">{manga.title || "Sans titre"}</h4>
                <p className="text-white/40 text-[10px] truncate">{manga.author?.username || "Inconnu"}</p>
                <div className="flex items-center gap-2 mt-0.5 text-white/40 text-[10px]">
                  <span className="flex items-center gap-0.5">
                    <Heart className="w-3 h-3" /> {manga.likesCount || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}