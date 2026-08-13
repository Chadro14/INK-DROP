"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  Heart, 
  Eye, 
  Search, 
  X, 
  BookOpen, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Flame,
  Users,
  Globe,
  Film,
  Library
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// ✅ ANIMES EN DUR (fallback si l'API ne fonctionne pas)
const FALLBACK_ANIMES = [
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    coverImage: "https://m.media-amazon.com/images/I/81sFGrAbkdL._AC_SL1500_.jpg",
    rating: 4.8,
    episodes: 47,
    genre: ["Action", "Surnaturel"],
  },
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    coverImage: "https://m.media-amazon.com/images/I/71yI-pV3KbL._AC_SL1500_.jpg",
    rating: 4.9,
    episodes: 12,
    genre: ["Action", "Fantastique"],
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    coverImage: "https://m.media-amazon.com/images/I/81uLEKlS4LL._AC_SL1500_.jpg",
    rating: 4.7,
    episodes: 55,
    genre: ["Action", "Aventure"],
  },
  {
    id: "one-piece",
    title: "One Piece",
    coverImage: "https://m.media-amazon.com/images/I/81jQw5Fw-WL._AC_SL1500_.jpg",
    rating: 4.6,
    episodes: 1100,
    genre: ["Aventure", "Comédie"],
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    coverImage: "https://m.media-amazon.com/images/I/81qLpG5TjRL._AC_SL1500_.jpg",
    rating: 4.8,
    episodes: 87,
    genre: ["Action", "Drame"],
  },
  {
    id: "naruto",
    title: "Naruto",
    coverImage: "https://m.media-amazon.com/images/I/81xP0l6rS-L._AC_SL1500_.jpg",
    rating: 4.5,
    episodes: 220,
    genre: ["Action", "Aventure"],
  },
];

const getImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_URL}/storage/${url}`;
};

type Manga = {
  id: string;
  title: string;
  coverUrl: string;
  author: { username: string; isCertified: boolean };
  likesCount: number;
  viewsCount: number;
  genre: string[];
  status: string;
};

type Creator = {
  id: string;
  username: string;
  avatarUrl: string;
  isCertified: boolean;
  _count: { mangas: number; followers: number };
};

type Anime = {
  id: string;
  title: string;
  coverImage: string;
  rating: number;
  episodes: number;
  genre: string[];
};

export default function Home() {
  const router = useRouter();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [trendingMangas, setTrendingMangas] = useState<Manga[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [animes, setAnimes] = useState<Anime[]>(FALLBACK_ANIMES);
  const [loading, setLoading] = useState(true);
  const [loadingAnimes, setLoadingAnimes] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentTrendIndex, setCurrentTrendIndex] = useState(0);
  const [infiniteMangas, setInfiniteMangas] = useState<Manga[]>([]);
  const [infinitePage, setInfinitePage] = useState(1);
  const [loadingInfinite, setLoadingInfinite] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // ============================================
  // FETCH MANGAS POPULAIRES
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mangasRes, trendingRes, creatorsRes, animesRes] = await Promise.all([
          fetch(`${API_URL}/mangas?limit=6&sort=popular`),
          fetch(`${API_URL}/mangas?limit=10&sort=trending`),
          fetch(`${API_URL}/users/top-creators?limit=6`),
          fetch(`${API_URL}/inkstream/popular?limit=6`).catch(() => ({ ok: false })),
        ]);

        const mangasData = mangasRes.ok ? await mangasRes.json() : { data: [] };
        const trendingData = trendingRes.ok ? await trendingRes.json() : { data: [] };
        const creatorsData = creatorsRes.ok ? await creatorsRes.json() : { data: [] };

        setMangas(mangasData.data || []);
        setTrendingMangas(trendingData.data || []);
        setCreators(creatorsData.data || []);

        // ✅ ANIMES : fallback si l'API ne fonctionne pas
        if (animesRes && animesRes.ok) {
          const animesData = await animesRes.json();
          if (animesData.data && animesData.data.length > 0) {
            setAnimes(animesData.data);
          } else {
            setAnimes(FALLBACK_ANIMES);
          }
        } else {
          setAnimes(FALLBACK_ANIMES);
        }

        setInfiniteMangas(mangasData.data || []);
      } catch (error) {
        console.error("Erreur chargement:", error);
        setAnimes(FALLBACK_ANIMES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================
  // DÉFILEMENT INFINI
  // ============================================
  useEffect(() => {
    const fetchMoreMangas = async () => {
      if (loadingInfinite || !hasMore) return;
      setLoadingInfinite(true);

      try {
        const res = await fetch(`${API_URL}/mangas?limit=6&page=${infinitePage}&sort=popular`);
        const data = await res.json();
        const newMangas = data.data || [];

        if (newMangas.length === 0) {
          setHasMore(false);
        } else {
          setInfiniteMangas((prev) => [...prev, ...newMangas]);
          setInfinitePage((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Erreur chargement infini:", error);
      } finally {
        setLoadingInfinite(false);
      }
    };

    if (infiniteMangas.length === 0 && !loading) {
      fetchMoreMangas();
    }
  }, [infiniteMangas.length, loading]);

  // ============================================
  // OBSERVER POUR LE DÉFILEMENT INFINI
  // ============================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingInfinite && hasMore) {
          fetchMoreMangas();
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadingInfinite, hasMore]);

  const fetchMoreMangas = async () => {
    if (loadingInfinite || !hasMore) return;
    setLoadingInfinite(true);

    try {
      const res = await fetch(`${API_URL}/mangas?limit=6&page=${infinitePage}&sort=popular`);
      const data = await res.json();
      const newMangas = data.data || [];

      if (newMangas.length === 0) {
        setHasMore(false);
      } else {
        setInfiniteMangas((prev) => [...prev, ...newMangas]);
        setInfinitePage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erreur chargement infini:", error);
    } finally {
      setLoadingInfinite(false);
    }
  };

  // ============================================
  // CARROUSEL TENDANCES
  // ============================================
  useEffect(() => {
    if (trendingMangas.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTrendIndex((prev) => (prev + 1) % trendingMangas.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [trendingMangas.length]);

  const nextTrend = () => {
    setCurrentTrendIndex((prev) => (prev + 1) % trendingMangas.length);
  };

  const prevTrend = () => {
    setCurrentTrendIndex((prev) => (prev - 1 + trendingMangas.length) % trendingMangas.length);
  };

  // ============================================
  // RECHERCHE
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/discover?search=${encodeURIComponent(search)}`);
    }
  };

  // ============================================
  // AFFICHAGE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-xl font-bold text-white tracking-tight">INKDROP</span>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-zinc-400 hover:text-white transition-colors p-2"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        {showSearch && (
          <form onSubmit={handleSearch} className="max-w-lg mx-auto mt-3 flex items-center gap-2 animate-fade-in">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un créateur ou un manga..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </header>

      {/* ===== TENDANCES ===== */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Tendances
          </h2>
          <Link href="/discover" className="text-zinc-500 text-xs font-medium hover:text-white transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="relative h-48 md:h-56">
            {trendingMangas.map((manga, index) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentTrendIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div className="w-full h-full relative">
                  {manga.coverUrl ? (
                    <img
                      src={getImageUrl(manga.coverUrl)}
                      alt={manga.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/80 text-white border border-blue-400/30">
                        🔥 Tendance
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800/80 text-yellow-400 border border-yellow-500/30 flex items-center gap-0.5">
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                        {manga.likesCount || 0}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mt-1">{manga.title}</h3>
                    <p className="text-zinc-400 text-xs">{manga.author?.username || "Inconnu"}</p>
                  </div>
                </div>
              </Link>
            ))}

            <button
              onClick={prevTrend}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md z-20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTrend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md z-20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {trendingMangas.slice(0, 6).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTrendIndex(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentTrendIndex ? "w-5 bg-blue-500" : "w-1.5 bg-zinc-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CRÉATEURS CERTIFIÉS ===== */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Créateurs certifiés
          </h2>
          <Link href="/discover" className="text-zinc-500 text-xs font-medium hover:text-white transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {creators.length > 0 ? (
            creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creator/${creator.username}`}
                className="flex flex-col items-center gap-1 flex-shrink-0 group"
              >
                <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-lg border-2 border-zinc-800 group-hover:border-blue-500 transition-all relative">
                  {creator.avatarUrl ? (
                    <img src={creator.avatarUrl} alt={creator.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    creator.username?.charAt(0).toUpperCase() || "?"
                  )}
                  {creator.isCertified && (
                    <span className="absolute -top-0.5 -right-0.5">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </span>
                  )}
                </div>
                <span className="text-zinc-400 text-[10px] truncate max-w-14 text-center">
                  {creator.username || "Inconnu"}
                </span>
              </Link>
            ))
          ) : (
            <div className="flex-1 text-center py-4">
              <p className="text-zinc-500 text-xs">Aucun créateur certifié pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== MANGA POPULAIRES ===== */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Mangas populaires
          </h2>
          <Link href="/discover" className="text-zinc-500 text-xs font-medium hover:text-white transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {mangas.slice(0, 6).map((manga) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="group bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all active:scale-[0.97]"
            >
              <div className="aspect-[2/3] bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                {manga.coverUrl ? (
                  <img
                    src={getImageUrl(manga.coverUrl)}
                    alt={manga.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <BookOpen className="w-8 h-8 text-zinc-700" />
                )}
                <div className="absolute top-1.5 left-1.5">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-600/80 text-white border border-blue-400/30">
                    {manga.genre?.[0] || "Manga"}
                  </span>
                </div>
              </div>
              <div className="p-2">
                <h4 className="text-xs font-bold truncate text-white group-hover:text-blue-400 transition-colors">
                  {manga.title}
                </h4>
                <p className="text-zinc-500 text-[9px] truncate">{manga.author?.username || "Inconnu"}</p>
                <div className="flex items-center gap-2 mt-0.5 text-zinc-500 text-[9px]">
                  <span className="flex items-center gap-0.5">
                    <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500/20" />
                    {manga.likesCount || 0}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5 text-blue-400" />
                    {manga.viewsCount || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

        {/* ===== ANIMES POPULAIRES (CORRIGÉ) ===== */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            Animes populaires
          </h2>
          <Link href="/inkstream" className="text-zinc-500 text-xs font-medium hover:text-white transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {animes.map((anime) => (
            <Link
              key={anime.id}
              href={`/inkstream/${anime.id}`}
              className="flex-shrink-0 w-32 group"
            >
              <div className="aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 group-hover:border-purple-500/50 transition-all relative">
                {anime.coverImage ? (
                  <img
                    src={anime.coverImage}
                    alt={anime.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                  {anime.rating || 'N/A'}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-white text-xs font-bold truncate">{anime.title}</p>
                  <p className="text-zinc-400 text-[9px]">{anime.episodes || 0} épisodes</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== DÉFILEMENT INFINI ===== */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Découvrir
          </h2>
        </div>
        <div className="space-y-4">
          {infiniteMangas.map((manga, index) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="block bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all active:scale-[0.98]"
            >
              <div className="flex gap-3 p-3">
                <div className="w-20 h-28 rounded-lg bg-zinc-900 flex-shrink-0 overflow-hidden">
                  {manga.coverUrl ? (
                    <img
                      src={getImageUrl(manga.coverUrl)}
                      alt={manga.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {manga.title}
                  </h3>
                  <p className="text-zinc-400 text-xs truncate">par {manga.author?.username || "Inconnu"}</p>
                  <div className="flex items-center gap-3 mt-1 text-zinc-500 text-[10px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                      {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3 text-blue-400" />
                      {manga.viewsCount || 0}
                    </span>
                    {manga.genre && manga.genre.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-400 text-[8px]">
                        {manga.genre[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <div ref={observerRef} className="h-4" />

          {loadingInfinite && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!hasMore && infiniteMangas.length > 0 && (
            <div className="text-center py-6">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
                <p className="text-zinc-400 text-sm font-medium">
                  🌐 Tu as atteint la fin des mangas INKDROP
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  Explore plus de mangas sur <span className="text-purple-400 font-semibold">MangaDex</span>
                </p>
                <Link
                  href="/discover?tab=mangadex"
                  className="mt-3 inline-block px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20"
                >
                  🔍 Découvrir MangaDex
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}