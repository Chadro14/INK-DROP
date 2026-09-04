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
  Library,
  BadgeCheck,
  Loader2,
  RotateCcw,
  Bell,
  Trophy,
  Crown,
  Zap,
} from "lucide-react";
import { io, Socket } from 'socket.io-client';

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

export default function Home() {
  const router = useRouter();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [trendingMangas, setTrendingMangas] = useState<Manga[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
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

  // ===== PWA =====
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // ===== NOTIFICATIONS =====
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);

  // ===== SAUVEGARDE =====
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
      console.error('Erreur sauvegarde:', error);
    }
  }, [infiniteMangas, phase, usedQueries, hasMoreInkdrop, hasMoreMangadex, infinitePage]);

  const saveStateDebounced = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveStateToBackend();
    }, SAVE_DEBOUNCE);
  }, [saveStateToBackend]);

  // ===== RESTAURATION =====
  const restoreStateFromBackend = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch(`${API_URL}/users/state`, {
        headers: { Authorization: `Bearer ${token}` },
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
        }, 500);
      }

      return true;
    } catch (error) {
      console.error('Erreur restauration:', error);
      return false;
    }
  }, []);

  // ===== WEBSOCKET =====
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      if (!userId) return;

      const newSocket = io(API_URL, {
        query: { userId },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connecté au WebSocket');
      });

      newSocket.on('notification', (data) => {
        console.log('Notification reçue:', data);
        setLatestNotification(data);
        setShowNotification(true);
        setNotifications((prev) => [data, ...prev]);
        setTimeout(() => setShowNotification(false), 5000);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('Erreur WebSocket:', error);
    }
  }, []);

  // ===== NAVIGATION =====
  const handleCreatorClick = (username: string) => {
    saveStateToBackend();
    router.push(`/creator/${encodeURIComponent(username)}`);
  };

  const handleMangaClick = (manga: any) => {
    saveStateToBackend();
    if (manga.source === "mangadex") {
      router.push(`/read/${manga.id}`);
    } else {
      router.push(`/manga/${manga.id}`);
    }
  };

  // ===== PWA =====
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
      setShowInstallBanner(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setShowInstallBanner(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setShowInstallBanner(false);
        } else {
          setTimeout(() => {
            if (!isAppInstalled) setShowInstallBanner(true);
          }, 30000);
        }
        setDeferredPrompt(null);
      });
    } else {
      alert('Utilisez le menu du navigateur : "Ajouter à l\'écran d\'accueil"');
    }
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    setTimeout(() => {
      if (!isAppInstalled) setShowInstallBanner(true);
    }, 60000);
  };

  // ===== FETCH DATA =====
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mangasRes, trendingRes, creatorsRes] = await Promise.all([
          fetch(`${API_URL}/mangas?limit=6&sort=popular`),
          fetch(`${API_URL}/mangas?limit=10&sort=trending`),
          fetch(`${API_URL}/creators/top?limit=6`).catch(() => ({ ok: false })),
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

        setIsRestored(true);
      } catch (error) {
        console.error("Erreur chargement:", error);
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

  // ===== INFINITE SCROLL =====
  useEffect(() => {
    if (totalMangas > 0 && infiniteMangas.filter(m => m.source === "inkdrop").length >= totalMangas && hasMoreInkdrop) {
      setHasMoreInkdrop(false);
    }
  }, [infiniteMangas, totalMangas, hasMoreInkdrop]);

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
      const existingIds = new Set(infiniteMangas.filter(m => m.source === "mangadex").map(m => m.id));
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
          language: selected.lang === "fr" ? "FR" : "EN",
        }));
        setInfiniteMangas((prev) => [...prev, ...mangadexMangas]);
      }
    } catch (error) {
      console.error("Erreur MangaDrop:", error);
      setHasMoreMangadex(false);
      setPhase("end");
    } finally {
      setLoadingInfinite(false);
    }
  };

  // ===== CARROUSEL TENDANCES =====
  const displayTrending = trendingMangas.length > 0 ? trendingMangas : mangas.slice(0, 6);

  useEffect(() => {
    if (displayTrending.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTrendIndex((prev) => (prev + 1) % displayTrending.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [displayTrending.length]);

  const nextTrend = () => setCurrentTrendIndex((prev) => (prev + 1) % displayTrending.length);
  const prevTrend = () => setCurrentTrendIndex((prev) => (prev - 1 + displayTrending.length) % displayTrending.length);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/discover?search=${encodeURIComponent(search)}`);
    }
  };

  // ===== OBSERVER =====
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
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground selection:bg-blue-500 selection:text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-xl font-bold text-foreground tracking-tight">INKDROP</span>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="p-2.5 rounded-xl bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </header>

      {/* ===== TENDANCES ===== */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Tendances
          </h2>
          <Link href="/discover" className="text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/40">
          <div className="relative h-48 md:h-56">
            {displayTrending.length > 0 ? (
              displayTrending.map((manga, index) => (
                <div
                  key={manga.id}
                  onClick={() => handleMangaClick(manga)}
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
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/80 text-white border border-blue-400/30">
                          Tendance
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-card/80 text-rose-400 border border-rose-500/30 flex items-center gap-0.5">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          {manga.likesCount || 0}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-foreground mt-1">{manga.title}</h3>
                      <p 
                        className="text-muted-foreground text-xs hover:text-blue-400 transition-colors cursor-pointer"
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
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <p>Aucune tendance</p>
              </div>
            )}

            {displayTrending.length > 1 && (
              <>
                <button
                  onClick={prevTrend}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/60 text-muted-foreground hover:text-foreground border border-border/60 backdrop-blur-md z-20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextTrend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/60 text-muted-foreground hover:text-foreground border border-border/60 backdrop-blur-md z-20 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {displayTrending.slice(0, 6).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTrendIndex(index)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentTrendIndex ? "w-5 bg-blue-500" : "w-1.5 bg-muted"
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
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Créateurs certifiés
          </h2>
          <Link href="/discover" className="text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
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
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-lg border-2 border-border group-hover:border-blue-500 transition-all relative">
                    {creator.avatarUrl ? (
                      <img src={creator.avatarUrl} alt={creator.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      creator.username?.charAt(0).toUpperCase() || "?"
                    )}
                    {creator.isCertified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-background p-0.5 rounded-full shadow-lg">
                        <BadgeCheck
                          className="w-5 h-5"
                          fill={badgeColor}
                          color="black"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-muted-foreground text-[10px] truncate max-w-14 text-center group-hover:text-blue-400 transition-colors">
                    {creator.username || "Inconnu"}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex-1 text-center py-4">
              <p className="text-muted-foreground text-xs">Aucun créateur certifié</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== MANGA POPULAIRES ===== */}
      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Mangas populaires
          </h2>
          <Link href="/discover" className="text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {mangas.slice(0, 6).map((manga) => {
            const authorBadgeColor = manga.author?.badgeColor || "#3B82F6";
            return (
              <div
                key={manga.id}
                onClick={() => handleMangaClick(manga)}
                className="group bg-card/40 border border-border/60 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all active:scale-[0.97] cursor-pointer"
              >
                <div className="aspect-[2/3] bg-muted flex items-center justify-center relative overflow-hidden">
                  {manga.coverUrl ? (
                    <img
                      src={getImageUrl(manga.coverUrl)}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                  )}
                  <div className="absolute top-1.5 left-1.5">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-600/80 text-white border border-blue-400/30">
                      {manga.genre?.[0] || "Manga"}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <h4 className="text-xs font-bold truncate text-foreground group-hover:text-blue-400 transition-colors">
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
                        className="w-4 h-4 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] text-muted-foreground font-bold">
                        {manga.author?.username?.charAt(0) || "?"}
                      </div>
                    )}
                    <p className="text-muted-foreground text-[9px] truncate flex items-center gap-0.5 group-hover:text-blue-400 transition-colors">
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
                  <div className="flex items-center gap-2 mt-0.5 text-muted-foreground text-[9px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 text-rose-500" />
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

      {/* ===== DÉFILEMENT INFINI ===== */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Découvrir
          </h2>
          <span className="text-xs text-muted-foreground">
            {phase === "inkdrop" && "INKDROP"}
            {phase === "transition" && "Transition..."}
            {phase === "mangadex" && `MangaDrop (${usedQueries.length}/${MANGADEX_QUERIES.length})`}
            {phase === "end" && "Terminé"}
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
                  onClick={() => handleMangaClick(manga)}
                  className="block bg-card/40 border border-border/60 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-28 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {manga.coverUrl ? (
                        <img
                          src={getImageUrl(manga.coverUrl)}
                          alt={manga.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">
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
                            className="w-4 h-4 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] text-muted-foreground font-bold">
                            {manga.author?.username?.charAt(0) || "?"}
                          </div>
                        )}
                        <p className="text-muted-foreground text-xs truncate flex items-center gap-0.5 group-hover:text-blue-400 transition-colors">
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
                      <div className="flex items-center gap-3 mt-1 text-muted-foreground text-[10px]">
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3 text-rose-500" />
                          {manga.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3 text-blue-400" />
                          {manga.viewsCount || 0}
                        </span>
                        {manga.genre && manga.genre.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground text-[8px] border border-border/30">
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
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-foreground">
                    Explorer <span className="text-purple-400 font-bold">100 000+ mangas</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {phase === "transition" && (
            <div className="text-center py-8 animate-pulse">
              <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-blue-950/40 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex justify-center mb-3">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <p className="text-foreground text-lg font-bold">
                  Chargement des mangas MangaDrop...
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
                    onClick={() => handleMangaClick(manga)}
                    className="block bg-card/40 border border-purple-800/40 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex gap-3 p-3">
                      <div className="w-20 h-28 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                        {manga.coverUrl ? (
                          <img
                            src={manga.coverUrl}
                            alt={manga.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-muted-foreground/30" />
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
                        <h3 className="text-sm font-bold text-foreground group-hover:text-purple-400 transition-colors">
                          {manga.title}
                        </h3>
                        <p className="text-muted-foreground text-xs truncate">par {manga.author?.username || "Inconnu"}</p>
                        <div className="flex items-center gap-3 mt-1 text-muted-foreground text-[10px]">
                          <span className="flex items-center gap-0.5 text-purple-400">
                            <Globe className="w-3 h-3" />
                            MangaDrop
                          </span>
                          <span className="flex items-center gap-0.5">
                            {manga.language || "🌐"}
                          </span>
                          {manga.chapters && (
                            <span className="flex items-center gap-0.5">
                              <Library className="w-3 h-3" />
                              {manga.chapters}
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    <span className="text-xs">
                      Chargement ({usedQueries.length}/{MANGADEX_QUERIES.length})
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
              <div className="bg-card/40 border border-border/60 rounded-2xl p-6">
                <p className="text-foreground text-lg font-bold">Tu as tout vu !</p>
                <p className="text-muted-foreground text-sm mt-1">Reviens demain pour découvrir de nouveaux mangas</p>
                <div className="flex justify-center gap-4 mt-3">
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/20"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Recharger
                  </Link>
                  <Link
                    href="/discover?tab=mangadex"
                    className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-purple-900/20"
                  >
                    <Globe className="w-4 h-4" />
                    MangaDrop
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== TOAST DE NOTIFICATION ===== */}
      {showNotification && latestNotification && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto bg-card/90 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-900/30 p-4 animate-slide-down backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-500/20 flex-shrink-0">
              <Bell className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{latestNotification.title || 'Nouvelle notification'}</p>
              <p className="text-xs text-muted-foreground">{latestNotification.body || ''}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===== BANDEAU D'INSTALLATION PWA ===== */}
      {showInstallBanner && !isAppInstalled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full mx-4 bg-gradient-to-b from-card to-background border border-blue-500/30 rounded-3xl p-8 shadow-2xl shadow-blue-900/40 animate-scale-up">
            
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-blue-400" />
            </div>

            <h2 className="text-2xl font-extrabold text-foreground text-center">
              Installer INKDROP
            </h2>

            <p className="text-muted-foreground text-center mt-2 text-sm leading-relaxed">
              Profitez de l'application <br />
              <span className="text-blue-400 font-medium">plus rapide et hors ligne</span>
            </p>

            <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="text-center">
                <Zap className="w-5 h-5 mx-auto text-green-400" />
                <p className="mt-1">Rapide</p>
              </div>
              <div className="text-center">
                <Globe className="w-5 h-5 mx-auto text-blue-400" />
                <p className="mt-1">Hors ligne</p>
              </div>
              <div className="text-center">
                <Crown className="w-5 h-5 mx-auto text-purple-400" />
                <p className="mt-1">Premium</p>
              </div>
            </div>

            <button
              onClick={handleInstall}
              className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold text-base transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
            >
              Installer l'application
            </button>

            <button
              onClick={handleDismissInstall}
              className="w-full mt-3 py-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Pas maintenant
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
