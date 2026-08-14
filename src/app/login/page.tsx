"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
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
  Library,
  BadgeCheck,
  Loader2,
  RotateCcw
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";
const SAVE_DEBOUNCE = 500;

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

const MANGADEX_QUERIES = [
  { query: "popular", lang: "fr" },
  { query: "action", lang: "fr" },
  { query: "romance", lang: "fr" },
  { query: "fantasy", lang: "fr" },
  { query: "adventure", lang: "fr" },
  { query: "comedy", lang: "fr" },
  { query: "drama", lang: "fr" },
  { query: "mystery", lang: "fr" },
  { query: "sci-fi", lang: "fr" },
  { query: "slice of life", lang: "fr" },
  { query: "supernatural", lang: "fr" },
  { query: "seinen", lang: "fr" },
  { query: "popular", lang: "en" },
  { query: "action", lang: "en" },
  { query: "romance", lang: "en" },
  { query: "fantasy", lang: "en" },
  { query: "adventure", lang: "en" },
  { query: "comedy", lang: "en" },
  { query: "shounen", lang: "en" },
  { query: "shoujo", lang: "en" },
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
  author: { 
    username: string; 
    isCertified: boolean; 
    badgeColor?: string;
    avatarUrl?: string;
  };
  likesCount: number;
  viewsCount: number;
  genre: string[];
  status: string;
  source?: "inkdrop" | "mangadex";
  language?: string;
};

type Creator = {
  id: string;
  username: string;
  avatarUrl: string;
  isCertified: boolean;
  badgeColor?: string;
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
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentTrendIndex, setCurrentTrendIndex] = useState(0);
  const [infiniteMangas, setInfiniteMangas] = useState<any[]>([]);
  const [infinitePage, setInfinitePage] = useState(1);
  const [loadingInfinite, setLoadingInfinite] = useState(false);
  const [hasMoreInkdrop, setHasMoreInkdrop] = useState(true);
  const [hasMoreMangadex, setHasMoreMangadex] = useState(true);
  const [phase, setPhase] = useState<"inkdrop" | "transition" | "mangadex" | "end">("inkdrop");
  const [totalMangas, setTotalMangas] = useState(0);
  const [usedQueries, setUsedQueries] = useState<string[]>([]);
  const [isRestored, setIsRestored] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // SAUVEGARDER DANS LE BACKEND
  // ============================================
  const saveStateToBackend = useCallback(async (scrollY?: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const state = {
        scrollY: scrollY !== undefined ? scrollY : window.scrollY,
        mangas: infiniteMangas.slice(-100),
        phase: phase,
        usedQueries: usedQueries,
        hasMoreInkdrop: hasMoreInkdrop,
        hasMoreMangadex: hasMoreMangadex,
        infinitePage: infinitePage,
        timestamp: Date.now(),
      };

      await fetch(`${API_URL}/users/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(state),
      });
    } catch (error) {
      console.error('❌ Erreur sauvegarde backend:', error);
    }
  }, [infiniteMangas, phase, usedQueries, hasMoreInkdrop, hasMoreMangadex, infinitePage]);

  // ============================================
  // SAUVEGARDE AVEC DEBOUNCE
  // ============================================
  const saveStateDebounced = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveStateToBackend();
    }, SAVE_DEBOUNCE);
  }, [saveStateToBackend]);

  // ============================================
  // RESTAURER DEPUIS LE BACKEND
  // ============================================
  const restoreStateFromBackend = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch(`${API_URL}/users/state`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (!data || !data.data) return false;

      const state = data.data;
      if (!state.mangas || !Array.isArray(state.mangas)) return false;

      setInfiniteMangas(state.mangas || []);
      setPhase(state.phase || "inkdrop");
      setUsedQueries(state.usedQueries || []);
      setHasMoreInkdrop(state.hasMoreInkdrop !== undefined ? state.hasMoreInkdrop : true);
      setHasMoreMangadex(state.hasMoreMangadex !== undefined ? state.hasMoreMangadex : true);
      setInfinitePage(state.infinitePage || 1);

      if (state.scrollY) {
        setTimeout(() => {
          window.scrollTo({ top: state.scrollY, behavior: 'instant' });
        }, 200);
      }

      console.log(`✅ État restauré depuis le backend (${state.mangas.length} mangas)`);
      return true;
    } catch (error) {
      console.error('❌ Erreur restauration backend:', error);
      return false;
    }
  }, []);

  // ============================================
  // SAUVEGARDER AVANT DE QUITTER
  // ============================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveStateToBackend();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStateToBackend]);

  // ============================================
  // SAUVEGARDER LE SCROLL EN TEMPS RÉEL
  // ============================================
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        saveStateToBackend(window.scrollY);
      }, SAVE_DEBOUNCE);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [saveStateToBackend]);

  // ============================================
  // SAUVEGARDE À CHAQUE CHANGEMENT
  // ============================================
  useEffect(() => {
    if (!loading && infiniteMangas.length > 0 && isRestored) {
      saveStateDebounced();
    }
  }, [infiniteMangas, phase, usedQueries, hasMoreInkdrop, hasMoreMangadex, infinitePage, loading, isRestored, saveStateDebounced]);

  // ============================================
  // NAVIGATION VERS LE PROFIL D'UN CRÉATEUR
  // ============================================
  const handleCreatorClick = (username: string) => {
    saveStateToBackend();
    router.push(`/creator/${username}`);
  };

  // ============================================
  // NAVIGATION VERS UN MANGA
  // ============================================
  const handleMangaClick = (mangaId: string) => {
    saveStateToBackend();
    router.push(`/manga/${mangaId}`);
  };

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
          fetch(`${API_URL}/creators/top?limit=6`),
          fetch(`${API_URL}/inkstream/popular?limit=6`).catch(() => ({ ok: false })),
        ]);

        const mangasData = mangasRes.ok ? await mangasRes.json() : { data: [], total: 0 };
        const trendingData = trendingRes.ok ? await trendingRes.json() : { data: [] };
        
        let creatorsData = { data: [] };
        if (creatorsRes.ok) {
          const json = await creatorsRes.json();
          creatorsData = { data: json.data || [] };
        }

        const inkdropMangas = (mangasData.data || []).map((m: any) => ({ ...m, source: "inkdrop" }));

        setMangas(inkdropMangas);
        setTrendingMangas(trendingData.data || []);
        setCreators(creatorsData.data || []);
        setTotalMangas(mangasData.total || 0);
        setInfiniteMangas(inkdropMangas);

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

        setIsRestored(true);
      } catch (error) {
        console.error("Erreur chargement:", error);
        setAnimes(FALLBACK_ANIMES);
        setIsRestored(true);
      } finally {
        setLoading(false);
      }
    };

    const restore = async () => {
      const restored = await restoreStateFromBackend();
      if (restored) {
        setIsRestored(true);
        setLoading(false);
        return;
      }
      fetchData();
    };

    restore();
  }, [restoreStateFromBackend]);

  // ============================================
  // FORCER LA TRANSITION
  // ============================================
  useEffect(() => {
    if (totalMangas > 0 && infiniteMangas.filter(m => m.source === "inkdrop").length >= totalMangas && hasMoreInkdrop) {
      setHasMoreInkdrop(false);
    }
  }, [infiniteMangas, totalMangas, hasMoreInkdrop]);

  // ============================================
  // CHARGER PLUS DE MANGAS INKDROP
  // ============================================
  const fetchMoreInkdrop = async () => {
    if (loadingInfinite || !hasMoreInkdrop) return;
    setLoadingInfinite(true);

    try {
      const res = await fetch(`${API_URL}/mangas?limit=10&page=${infinitePage}&sort=popular`);
      const data = await res.json();
      const newMangas = data.data || [];

      if (newMangas.length === 0) {
        setHasMoreInkdrop(false);
      } else {
        const inkdropMangas = newMangas.map((m: any) => ({ ...m, source: "inkdrop" }));
        setInfiniteMangas((prev) => [...prev, ...inkdropMangas]);
        setInfinitePage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erreur chargement INKDROP:", error);
      setHasMoreInkdrop(false);
    } finally {
      setLoadingInfinite(false);
    }
  };

  // ============================================
  // CHARGER PLUS DE MANGAS MANGADROP
  // ============================================
  const fetchMoreMangadex = async () => {
    if (loadingInfinite || !hasMoreMangadex) return;
    setLoadingInfinite(true);

    try {
      const availableQueries = MANGADEX_QUERIES.filter(q => !usedQueries.includes(q.query + q.lang));
      
      if (availableQueries.length === 0) {
        setHasMoreMangadex(false);
        setPhase("end");
        setLoadingInfinite(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableQueries.length);
      const selected = availableQueries[randomIndex];
      setUsedQueries(prev => [...prev, selected.query + selected.lang]);

      const langParam = selected.lang === "fr" ? "&availableTranslatedLanguage[]=fr" : "&availableTranslatedLanguage[]=en";
      const res = await fetch(`${API_URL}/manga-api/search?q=${selected.query}&limit=50${langParam}`);
      let newMangas = [];

      if (res.ok) {
        const data = await res.json();
        newMangas = data.data || [];
      }

      const shuffledMangas = newMangas.sort(() => Math.random() - 0.5);

      const existingIds = new Set(
        infiniteMangas
          .filter(m => m.source === "mangadex")
          .map(m => m.id)
      );

      const uniqueNewMangas = shuffledMangas.filter((m: any) => !existingIds.has(m.id));

      if (uniqueNewMangas.length === 0) {
        const remaining = MANGADEX_QUERIES.filter(q => !usedQueries.includes(q.query + q.lang));
        if (remaining.length > 0) {
          setUsedQueries(prev => prev.filter(q => q !== selected.query + selected.lang));
          await fetchMoreMangadex();
        } else {
          setHasMoreMangadex(false);
          setPhase("end");
        }
      } else {
        const mangadexMangas = uniqueNewMangas.map((m: any) => ({
          id: m.id,
          title: m.title,
          coverUrl: m.coverImage,
          author: { username: m.author?.name || "Inconnu", isCertified: false, avatarUrl: null },
          likesCount: 0,
          viewsCount: 0,
          genre: m.genres || [],
          status: m.status || "ongoing",
          source: "mangadex",
          rating: m.rating,
          chapters: m.chapters || 0,
          language: selected.lang === "fr" ? "🇫🇷" : "🇬🇧",
        }));
        setInfiniteMangas((prev) => [...prev, ...mangadexMangas]);
      }
    } catch (error) {
      console.error("Erreur chargement MangaDrop:", error);
      setHasMoreMangadex(false);
      setPhase("end");
    } finally {
      setLoadingInfinite(false);
    }
  };

  // ============================================
  // CARROUSEL TENDANCES
  // ============================================
  const displayTrending = trendingMangas.length > 0 ? trendingMangas : mangas.slice(0, 6);

  useEffect(() => {
    if (displayTrending.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTrendIndex((prev) => (prev + 1) % displayTrending.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [displayTrending.length]);

  const nextTrend = () => {
    setCurrentTrendIndex((prev) => (prev + 1) % displayTrending.length);
  };

  const prevTrend = () => {
    setCurrentTrendIndex((prev) => (prev - 1 + displayTrending.length) % displayTrending.length);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/discover?search=${encodeURIComponent(search)}`);
    }
  };

  // ============================================
  // OBSERVER POUR LE DÉFILEMENT INFINI
  // ============================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingInfinite) {
          if (phase === "inkdrop" && hasMoreInkdrop) {
            fetchMoreInkdrop();
          } else if (phase === "mangadex" && hasMoreMangadex) {
            fetchMoreMangadex();
          }
        }
      },
      { threshold: 0.3 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [phase, loadingInfinite, hasMoreInkdrop, hasMoreMangadex]);

  if (loading) {
    return <Loader message="Chargement des mangas" />;
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
            {displayTrending.length > 0 ? (
              displayTrending.map((manga, index) => (
                <div
                  key={manga.id}
                  onClick={() => handleMangaClick(manga.id)}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
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
                      <p 
                        className="text-zinc-400 text-xs hover:text-blue-400 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (manga.author?.username) {
                            handleCreatorClick(manga.author.username);
                          }
                        }}
                      >
                        {manga.author?.username || "Inconnu"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <p>Aucune tendance pour le moment</p>
              </div>
            )}

            {displayTrending.length > 1 && (
              <>
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
                  {displayTrending.slice(0, 6).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTrendIndex(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentTrendIndex ? "w-5 bg-blue-500" : "w-1.5 bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
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
            creators.map((creator) => {
              const badgeColor = creator.badgeColor || "#3B82F6";
              return (
                <div
                  key={creator.id}
                  onClick={() => handleCreatorClick(creator.username)}
                  className="flex flex-col items-center gap-1 flex-shrink-0 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-lg border-2 border-zinc-800 group-hover:border-blue-500 transition-all relative">
                    {creator.avatarUrl ? (
                      <img src={creator.avatarUrl} alt={creator.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      creator.username?.charAt(0).toUpperCase() || "?"
                    )}
                    {creator.isCertified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-zinc-950 p-0.5 rounded-full shadow-lg">
                        <BadgeCheck
                          className="w-5 h-5"
                          fill={badgeColor}
                          color="black"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-zinc-400 text-[10px] truncate max-w-14 text-center group-hover:text-blue-400 transition-colors">
                    {creator.username || "Inconnu"}
                  </span>
                </div>
              );
            })
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
          {mangas.slice(0, 6).map((manga) => {
            const authorBadgeColor = manga.author?.badgeColor || "#3B82F6";
            return (
              <div
                key={manga.id}
                onClick={() => handleMangaClick(manga.id)}
                className="group bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all active:scale-[0.97] cursor-pointer"
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
                  <div 
                    className="flex items-center gap-1.5 mt-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (manga.author?.username) {
                        handleCreatorClick(manga.author.username);
                      }
                    }}
                  >
                    {manga.author?.avatarUrl ? (
                      <img 
                        src={manga.author.avatarUrl} 
                        alt={manga.author.username} 
                        className="w-4 h-4 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-500 font-bold">
                        {manga.author?.username?.charAt(0) || "?"}
                      </div>
                    )}
                    <p className="text-zinc-500 text-[9px] truncate flex items-center gap-0.5 group-hover:text-blue-400 transition-colors">
                      {manga.author?.username || "Inconnu"}
                      {manga.author?.isCertified && (
                        <BadgeCheck
                          className="w-3 h-3"
                          fill={authorBadgeColor}
                          color="black"
                          strokeWidth={1.5}
                        />
                      )}
                    </p>
                  </div>
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
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== ANIMES POPULAIRES ===== */}
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
          <span className="text-xs text-zinc-500">
            {phase === "inkdrop" && "INKDROP"}
            {phase === "transition" && "⏳ Transition..."}
            {phase === "mangadex" && `🌐 MangaDrop (${usedQueries.length}/${MANGADEX_QUERIES.length})`}
            {phase === "end" && "✅ Fin"}
          </span>
        </div>

        <div className="space-y-4">
          {infiniteMangas
            .filter((m) => m.source === "inkdrop")
            .map((manga) => {
              const authorBadgeColor = manga.author?.badgeColor || "#3B82F6";
              return (
                <div
                  key={manga.id}
                  onClick={() => handleMangaClick(manga.id)}
                  className="block bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all active:scale-[0.98] cursor-pointer"
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
                      <div 
                        className="flex items-center gap-1.5 mt-0.5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (manga.author?.username) {
                            handleCreatorClick(manga.author.username);
                          }
                        }}
                      >
                        {manga.author?.avatarUrl ? (
                          <img 
                            src={manga.author.avatarUrl} 
                            alt={manga.author.username} 
                            className="w-4 h-4 rounded-full object-cover border border-zinc-700"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-500 font-bold">
                            {manga.author?.username?.charAt(0) || "?"}
                          </div>
                        )}
                        <p className="text-zinc-400 text-xs truncate flex items-center gap-0.5 group-hover:text-blue-400 transition-colors">
                          {manga.author?.username || "Inconnu"}
                          {manga.author?.isCertified && (
                            <BadgeCheck
                              className="w-3 h-3"
                              fill={authorBadgeColor}
                              color="black"
                              strokeWidth={1.5}
                            />
                          )}
                        </p>
                      </div>
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
                </div>
              );
            })}

          {/* ===== BOUTON MANGADROP ===== */}
          {!hasMoreInkdrop && phase === "inkdrop" && infiniteMangas.filter(m => m.source === "inkdrop").length > 0 && (
            <div className="text-center py-4">
              <button
                onClick={() => {
                  setPhase("mangadex");
                  fetchMoreMangadex();
                }}
                className="group relative overflow-hidden w-full max-w-sm mx-auto px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border border-blue-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">
                    Explore plus de <span className="text-purple-400 font-bold">100 000 mangas</span>, clique ici pour en découvrir.
                  </span>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </button>
            </div>
          )}

          {phase === "transition" && (
            <div className="text-center py-8 animate-pulse">
              <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-blue-950/40 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex justify-center mb-3">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <p className="text-white text-lg font-bold">
                  📚 Chargement des mangas MangaDrop...
                </p>
                <p className="text-zinc-400 text-sm mt-1">
                  Prépare-toi à découvrir de nouveaux mondes
                </p>
              </div>
            </div>
          )}

          {phase === "mangadex" && (
            <>
              {infiniteMangas
                .filter((m) => m.source === "mangadex")
                .map((manga, index) => (
                  <div
                    key={`mangadex-${manga.id}-${index}`}
                    onClick={() => handleMangaClick(manga.id)}
                    className="block bg-zinc-900/40 border border-purple-800/40 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="w-20 h-28 rounded-lg bg-zinc-900 flex-shrink-0 overflow-hidden relative">
                        {manga.coverUrl ? (
                          <img
                            src={manga.coverUrl}
                            alt={manga.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-zinc-700" />
                          </div>
                        )}
                        <div className="absolute top-1 left-1 flex gap-1">
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-600/80 text-white border border-purple-400/30">
                            <Globe className="w-3 h-3" />
                          </span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white border border-white/20">
                            {manga.language || "🌐"}
                          </span>
                        </div>
                        {manga.rating && (
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[8px] font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                            {manga.rating}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                          {manga.title}
                        </h3>
                        <p className="text-zinc-400 text-xs truncate">par {manga.author?.username || "Inconnu"}</p>
                        <div className="flex items-center gap-3 mt-1 text-zinc-500 text-[10px]">
                          <span className="flex items-center gap-0.5 text-purple-400">
                            <Globe className="w-3 h-3" />
                            MangaDrop
                          </span>
                          <span className="flex items-center gap-0.5 text-zinc-400">
                            {manga.language || "🌐"}
                          </span>
                          {manga.chapters && (
                            <span className="flex items-center gap-0.5">
                              <Library className="w-3 h-3" />
                              {manga.chapters} chapitres
                            </span>
                          )}
                          {manga.genre && manga.genre.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 text-[8px]">
                              {manga.genre[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {loadingInfinite && phase === "mangadex" && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    <span className="text-xs">
                      Chargement des mangas MangaDrop ({usedQueries.length}/{MANGADEX_QUERIES.length})
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {(phase === "inkdrop" && hasMoreInkdrop) && (
            <div ref={observerRef} className="h-4" />
          )}

          {(phase === "mangadex" && hasMoreMangadex) && (
            <div ref={observerRef} className="h-4" />
          )}

          {phase === "end" && (
            <div className="text-center py-8">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
                <p className="text-white text-lg font-bold">🎉 Tu as tout vu !</p>
                <p className="text-zinc-400 text-sm mt-1">
                  Reviens demain pour découvrir de nouveaux mangas INKDROP
                </p>
                <div className="flex justify-center gap-4 mt-3">
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Recharger
                  </Link>
                  <Link
                    href="/discover?tab=mangadex"
                    className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Globe className="w-4 h-4" />
                    Explorer MangaDrop
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
