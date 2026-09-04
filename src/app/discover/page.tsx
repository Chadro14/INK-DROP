"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  Search, 
  X, 
  BookOpen, 
  Heart, 
  Eye, 
  Sparkles,
  Globe,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Library,
  Clock,
  TrendingUp,
  Flame,
  Star,
  Crown,
  ArrowRight,
  Filter
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

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
  rating?: number;
  chapters?: number;
  description?: string;
};

const MANGADEX_SEARCH_QUERIES = [
  "popular", "action", "romance", "fantasy", "adventure",
  "comedy", "drama", "mystery", "sci-fi", "supernatural",
  "shounen", "shoujo", "seinen", "slice of life", "sports",
  "horror", "thriller", "magic", "school", "historical"
];

export default function DiscoverPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"inkdrop" | "mangadex">("inkdrop");
  
  const [inkdropMangas, setInkdropMangas] = useState<Manga[]>([]);
  const [inkdropLoading, setInkdropLoading] = useState(true);
  const [inkdropError, setInkdropError] = useState("");
  const [inkdropSearch, setInkdropSearch] = useState("");
  const [inkdropShowSearch, setInkdropShowSearch] = useState(false);
  const [inkdropGenre, setInkdropGenre] = useState("");
  const [inkdropPage, setInkdropPage] = useState(1);
  const [inkdropTotalPages, setInkdropTotalPages] = useState(1);
  
  const [mangadexMangas, setMangadexMangas] = useState<Manga[]>([]);
  const [mangadexLoading, setMangadexLoading] = useState(false);
  const [mangadexError, setMangadexError] = useState("");
  const [mangadexSearch, setMangadexSearch] = useState("");
  const [mangadexShowSearch, setMangadexShowSearch] = useState(false);
  const [mangadexPage, setMangadexPage] = useState(1);
  const [hasMoreMangadex, setHasMoreMangadex] = useState(true);
  const [mangadexQuery, setMangadexQuery] = useState("");
  const [mangadexLoadingMore, setMangadexLoadingMore] = useState(false);
  const [mangadexInitialized, setMangadexInitialized] = useState(false);
  
  const [inkdropFeaturedIndex, setInkdropFeaturedIndex] = useState(0);
  const [mangadexFeaturedIndex, setMangadexFeaturedIndex] = useState(0);
  
  const observerRef = useRef<HTMLDivElement | null>(null);
  const inkdropIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mangadexIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const genres = [
    "Action", "Aventure", "Comédie", "Drame", "Fantastique",
    "Horreur", "Mystère", "Romance", "Science-fiction", "Surnaturel",
    "Tranche de vie", "Thriller"
  ];

  // ============================================
  // RÉCUPÉRER LES MANGAS INKDROP
  // ============================================
  useEffect(() => {
    const fetchInkdrop = async () => {
      setInkdropLoading(true);
      setInkdropError("");
      try {
        let url = `${API_URL}/mangas?page=${inkdropPage}&limit=20`;
        if (inkdropSearch) {
          url += `&search=${encodeURIComponent(inkdropSearch)}`;
        }
        if (inkdropGenre) {
          url += `&genre=${encodeURIComponent(inkdropGenre)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Erreur chargement INKDROP");
        const data = await res.json();
        const mangas = (data.data || []).map((m: any) => ({
          ...m,
          source: "inkdrop" as const
        }));
        setInkdropMangas(mangas);
        setInkdropTotalPages(data.lastPage || 1);
      } catch (err: any) {
        setInkdropError(err.message);
      } finally {
        setInkdropLoading(false);
      }
    };
    fetchInkdrop();
  }, [inkdropPage, inkdropSearch, inkdropGenre]);

  // ============================================
  // RÉCUPÉRER LES MANGAS MANGADROP
  // ============================================
  const fetchMangadexDefault = async () => {
    setMangadexLoading(true);
    setMangadexError("");
    try {
      const randomQuery = MANGADEX_SEARCH_QUERIES[
        Math.floor(Math.random() * MANGADEX_SEARCH_QUERIES.length)
      ];
      
      const langParam = "&availableTranslatedLanguage[]=fr&availableTranslatedLanguage[]=en";
      const res = await fetch(
        `${API_URL}/manga-api/search?q=${randomQuery}&limit=20${langParam}`
      );
      
      if (!res.ok) throw new Error("Erreur chargement MangaDrop");
      const data = await res.json();
      const mangas = (data.data || []).map((m: any) => ({
        id: m.id,
        title: m.title || "Sans titre",
        coverUrl: m.coverImage || "",
        author: { 
          username: m.author?.name || "Inconnu", 
          isCertified: false,
          badgeColor: "#7C3AED"
        },
        likesCount: 0,
        viewsCount: 0,
        genre: m.genres || [],
        status: m.status || "ongoing",
        source: "mangadex" as const,
        language: m.language || "🌐",
        rating: m.rating || 0,
        chapters: m.chapters || 0,
        description: m.description || ""
      }));
      
      setMangadexMangas(mangas);
      setHasMoreMangadex(false);
      setMangadexQuery("top");
      setMangadexInitialized(true);
    } catch (err: any) {
      setMangadexError(err.message);
    } finally {
      setMangadexLoading(false);
    }
  };

  const fetchMangadexSearch = async (query: string, page: number = 1) => {
    if (!query) return;
    setMangadexLoading(true);
    setMangadexError("");
    try {
      const langParam = "&availableTranslatedLanguage[]=fr&availableTranslatedLanguage[]=en";
      const res = await fetch(
        `${API_URL}/manga-api/search?q=${encodeURIComponent(query)}&limit=20&page=${page}${langParam}`
      );
      if (!res.ok) throw new Error("Erreur MangaDrop");
      const data = await res.json();
      const mangas = (data.data || []).map((m: any) => ({
        id: m.id,
        title: m.title || "Sans titre",
        coverUrl: m.coverImage || "",
        author: { 
          username: m.author?.name || "Inconnu", 
          isCertified: false,
          badgeColor: "#7C3AED"
        },
        likesCount: 0,
        viewsCount: 0,
        genre: m.genres || [],
        status: m.status || "ongoing",
        source: "mangadex" as const,
        language: m.language || "🌐",
        rating: m.rating || 0,
        chapters: m.chapters || 0,
        description: m.description || ""
      }));
      if (page === 1) {
        setMangadexMangas(mangas);
      } else {
        setMangadexMangas(prev => [...prev, ...mangas]);
      }
      setHasMoreMangadex(mangas.length > 0 && page < (data.lastPage || 1));
      setMangadexPage(page);
      setMangadexQuery(query);
    } catch (err: any) {
      setMangadexError(err.message);
    } finally {
      setMangadexLoading(false);
      setMangadexLoadingMore(false);
    }
  };

  // ============================================
  // CHARGEMENT AUTO DE MANGADROP
  // ============================================
  useEffect(() => {
    if (activeTab === "mangadex" && !mangadexInitialized && !mangadexQuery) {
      fetchMangadexDefault();
    }
  }, [activeTab, mangadexInitialized, mangadexQuery]);

  // ============================================
  // RECHERCHE MANGADROP
  // ============================================
  const handleMangadexSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mangadexSearch.trim()) {
      setMangadexInitialized(true);
      fetchMangadexSearch(mangadexSearch, 1);
      setMangadexShowSearch(false);
    }
  };

  // ============================================
  // INFINITE SCROLL MANGADROP
  // ============================================
  useEffect(() => {
    if (!mangadexQuery || activeTab !== "mangadex" || mangadexQuery === "top") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMangadex && !mangadexLoadingMore && !mangadexLoading) {
          setMangadexLoadingMore(true);
          fetchMangadexSearch(mangadexQuery, mangadexPage + 1);
        }
      },
      { threshold: 0.5 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [mangadexQuery, mangadexPage, hasMoreMangadex, mangadexLoadingMore, mangadexLoading, activeTab]);

  // ============================================
  // VITRINE AUTO
  // ============================================
  useEffect(() => {
    if (inkdropMangas.length > 0 && activeTab === "inkdrop") {
      inkdropIntervalRef.current = setInterval(() => {
        setInkdropFeaturedIndex((prev) => (prev + 1) % inkdropMangas.length);
      }, 4000);
    }
    return () => {
      if (inkdropIntervalRef.current) clearInterval(inkdropIntervalRef.current);
    };
  }, [inkdropMangas, activeTab]);

  useEffect(() => {
    if (mangadexMangas.length > 0 && activeTab === "mangadex") {
      mangadexIntervalRef.current = setInterval(() => {
        setMangadexFeaturedIndex((prev) => (prev + 1) % mangadexMangas.length);
      }, 4000);
    }
    return () => {
      if (mangadexIntervalRef.current) clearInterval(mangadexIntervalRef.current);
    };
  }, [mangadexMangas, activeTab]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleMangaClick = (mangaId: string, source?: string) => {
    if (source === "mangadex") {
      router.push(`/read/${mangaId}`);
    } else {
      router.push(`/manga/${mangaId}`);
    }
  };

  const clearInkdropSearch = () => {
    setInkdropSearch("");
    setInkdropGenre("");
    setInkdropPage(1);
    setInkdropShowSearch(false);
  };

  const clearMangadexSearch = () => {
    setMangadexSearch("");
    setMangadexQuery("");
    setMangadexMangas([]);
    setHasMoreMangadex(true);
    setMangadexShowSearch(false);
    setMangadexInitialized(false);
  };

  const refreshMangadex = () => {
    setMangadexMangas([]);
    setMangadexInitialized(false);
    setMangadexQuery("");
    setMangadexError("");
    fetchMangadexDefault();
  };

  const getFeaturedManga = (mangas: Manga[], index: number) => {
    if (mangas.length === 0) return null;
    return mangas[index % mangas.length];
  };

  // ============================================
  // COMPOSANT VITRINE - Style Webtoon
  // ============================================
  const FeaturedCard = ({ manga, source }: { manga: Manga | null; source: "inkdrop" | "mangadex" }) => {
    if (!manga) return null;
    const isInkdrop = source === "inkdrop";
    const accentColor = isInkdrop ? "blue" : "purple";

    return (
      <div 
        onClick={() => handleMangaClick(manga.id, source)}
        className="relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br from-background/80 to-card/80 border border-border/60 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-${accentColor}-900/5 group"
      >
        <div className="flex h-44 md:h-56">
          <div className="w-1/3 md:w-2/5 h-full flex-shrink-0">
            {manga.coverUrl ? (
              <img 
                src={manga.coverUrl} 
                alt={manga.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-${accentColor}-600/80 text-white border border-${accentColor}-400/30`}>
                  {isInkdrop ? 'INKDROP' : 'MangaDrop'}
                </span>
                {manga.rating && manga.rating > 0 && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/70 text-white border border-white/20 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {manga.rating}
                  </span>
                )}
                {manga.status && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${manga.status === 'ongoing' ? 'bg-emerald-600/40 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-600/40 text-zinc-400 border border-zinc-500/30'}`}>
                    {manga.status === 'ongoing' ? 'En cours' : 'Terminé'}
                  </span>
                )}
              </div>
              <h3 className="text-lg md:text-2xl font-extrabold text-foreground mt-2 line-clamp-2 leading-tight">
                {manga.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {manga.author?.username || "Inconnu"}
              </p>
              {manga.genre && manga.genre.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {manga.genre.slice(0, 3).map((g) => (
                    <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/30">
                      {g}
                    </span>
                  ))}
                  {manga.genre.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                      +{manga.genre.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-rose-500" />
                  {manga.likesCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-${accentColor}-400" />
                  {manga.viewsCount || 0}
                </span>
                {manga.chapters && manga.chapters > 0 && (
                  <span className="flex items-center gap-1 text-${accentColor}-400">
                    <BookOpen className="w-4 h-4" />
                    {manga.chapters} chap.
                  </span>
                )}
              </div>
              <ArrowRight className={`w-5 h-5 text-muted-foreground group-hover:text-${accentColor}-400 transition-colors`} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // COMPOSANT GRILLE - Style Webtoon
  // ============================================
  const MangaGrid = ({ mangas, source, loadingMore }: { mangas: Manga[]; source: "inkdrop" | "mangadex"; loadingMore?: boolean }) => {
    const isInkdrop = source === "inkdrop";
    const accentColor = isInkdrop ? "blue" : "purple";

    if (mangas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground mt-4 text-sm font-medium">
            {isInkdrop ? "Aucun manga INKDROP disponible" : "Aucun résultat sur MangaDrop"}
          </p>
          {!isInkdrop && !mangadexQuery && (
            <button
              onClick={refreshMangadex}
              className={`mt-4 px-6 py-2.5 rounded-full bg-${accentColor}-600 hover:bg-${accentColor}-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-${accentColor}-900/20`}
            >
              <RefreshCw className="w-4 h-4" />
              Charger d'autres mangas
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {mangas.map((manga) => (
          <div
            key={manga.id}
            onClick={() => handleMangaClick(manga.id, source)}
            className="group bg-card/60 border border-border/60 rounded-xl overflow-hidden hover:border-${accentColor}-500/50 transition-all hover:shadow-lg hover:shadow-${accentColor}-900/10 active:scale-[0.97] cursor-pointer"
          >
            <div className="aspect-[2/3] bg-muted flex items-center justify-center relative overflow-hidden">
              {manga.coverUrl ? (
                <img
                  src={manga.coverUrl}
                  alt={manga.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <BookOpen className="w-10 h-10 text-muted-foreground/30" />
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded bg-${accentColor}-600/90 text-white border border-${accentColor}-400/30`}>
                  {isInkdrop ? 'INKDROP' : 'MangaDrop'}
                </span>
                {manga.source === "mangadex" && manga.rating && manga.rating > 0 && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white border border-white/20 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                    {manga.rating}
                  </span>
                )}
              </div>
              {manga.source === "mangadex" && manga.language && (
                <div className="absolute bottom-2 right-2">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white border border-white/20">
                    {manga.language}
                  </span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <h4 className="text-sm font-bold truncate text-foreground group-hover:text-${accentColor}-400 transition-colors">
                {manga.title}
              </h4>
              <p className="text-muted-foreground text-[10px] truncate">
                {manga.author?.username || "Inconnu"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground text-[10px]">
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3 text-rose-500" />
                  {manga.likesCount || 0}
                </span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3 text-${accentColor}-400" />
                  {manga.viewsCount || 0}
                </span>
                {manga.source === "mangadex" && manga.chapters && manga.chapters > 0 && (
                  <span className={`text-${accentColor}-400 text-[9px]`}>
                    {manga.chapters} chap.
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ============================================
  // RENDU PRINCIPAL
  // ============================================
  if (inkdropLoading && activeTab === "inkdrop") {
    return <Loader message="Chargement des mangas INKDROP" />;
  }

  const featuredInkdrop = getFeaturedManga(inkdropMangas, inkdropFeaturedIndex);
  const featuredMangadex = getFeaturedManga(mangadexMangas, mangadexFeaturedIndex);

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <span className="text-base font-bold tracking-tight text-foreground/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Découvrir
          </span>
          <div className="flex items-center gap-2">
            {activeTab === "mangadex" && (
              <>
                <button
                  onClick={refreshMangadex}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
                  title="Charger d'autres mangas"
                >
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                </button>
                <button
                  onClick={() => setMangadexShowSearch(!mangadexShowSearch)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
                >
                  <Search className="w-5 h-5" />
                </button>
              </>
            )}
            {activeTab === "inkdrop" && (
              <button
                onClick={() => setInkdropShowSearch(!inkdropShowSearch)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* RECHERCHE INKDROP */}
        {activeTab === "inkdrop" && inkdropShowSearch && (
          <div className="max-w-6xl mx-auto mt-3 flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inkdropSearch}
                onChange={(e) => setInkdropSearch(e.target.value)}
                placeholder="Rechercher un manga INKDROP..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm"
                autoFocus
              />
              <button
                onClick={() => { setInkdropPage(1); setInkdropShowSearch(false); }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-900/20"
              >
                OK
              </button>
              <button
                onClick={() => setInkdropShowSearch(false)}
                className="p-2.5 rounded-xl bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInkdropGenre("")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${inkdropGenre === "" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
              >
                Tous
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => { setInkdropGenre(genre === inkdropGenre ? "" : genre); setInkdropPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${inkdropGenre === genre ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {(inkdropSearch || inkdropGenre) && (
              <button onClick={clearInkdropSearch} className="text-xs text-muted-foreground hover:text-foreground text-left">
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* RECHERCHE MANGADROP */}
        {activeTab === "mangadex" && mangadexShowSearch && (
          <div className="max-w-6xl mx-auto mt-3 flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={mangadexSearch}
                  onChange={(e) => setMangadexSearch(e.target.value)}
                  placeholder="Rechercher sur MangaDrop..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/90 border border-purple-800/50 text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none transition-all text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                onClick={handleMangadexSearch}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-900/20"
              >
                OK
              </button>
              <button
                onClick={() => setMangadexShowSearch(false)}
                className="p-2.5 rounded-xl bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {mangadexQuery && mangadexQuery !== "top" && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400">Résultats pour "{mangadexQuery}"</span>
                <button onClick={clearMangadexSearch} className="text-xs text-muted-foreground hover:text-foreground">
                  Effacer
                </button>
              </div>
            )}
            {mangadexQuery === "top" && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400">Top mangas MangaDrop</span>
                <button 
                  onClick={refreshMangadex} 
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Nouveaux
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ===== ONGLETS ===== */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-4">
        <div className="flex gap-2 bg-card/40 p-1 rounded-xl border border-border/60">
          <button
            onClick={() => setActiveTab("inkdrop")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "inkdrop"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Library className="w-4 h-4" />
            INKDROP
          </button>
          <button
            onClick={() => setActiveTab("mangadex")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "mangadex"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Globe className="w-4 h-4" />
            MangaDrop
          </button>
        </div>
      </div>

      {/* ===== CONTENU ===== */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">

        {/* ===== ONGLET INKDROP ===== */}
        {activeTab === "inkdrop" && (
          <div className="space-y-6">
            {/* Vitrine INKDROP */}
            {featuredInkdrop && (
              <div className="animate-fade-in">
                <FeaturedCard manga={featuredInkdrop} source="inkdrop" />
                <div className="flex justify-center gap-1.5 mt-3">
                  {inkdropMangas.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInkdropFeaturedIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === inkdropFeaturedIndex ? "w-6 bg-blue-500" : "w-2 bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grille INKDROP */}
            {inkdropError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">{inkdropError}</p>
                <button onClick={() => { setInkdropPage(1); setInkdropSearch(""); setInkdropGenre(""); }} className="mt-2 text-blue-400 text-sm hover:text-blue-300 transition-colors">
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                <MangaGrid mangas={inkdropMangas} source="inkdrop" />
                {inkdropTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <button
                      onClick={() => setInkdropPage(p => Math.max(1, p - 1))}
                      disabled={inkdropPage === 1}
                      className="p-2 rounded-lg bg-card/40 border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground font-medium">{inkdropPage} / {inkdropTotalPages}</span>
                    <button
                      onClick={() => setInkdropPage(p => Math.min(inkdropTotalPages, p + 1))}
                      disabled={inkdropPage === inkdropTotalPages}
                      className="p-2 rounded-lg bg-card/40 border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== ONGLET MANGADROP ===== */}
        {activeTab === "mangadex" && (
          <div className="space-y-6">
            {/* Vitrine MangaDrop */}
            {mangadexMangas.length > 0 && featuredMangadex && (
              <div className="animate-fade-in">
                <FeaturedCard manga={featuredMangadex} source="mangadex" />
                <div className="flex justify-center gap-1.5 mt-3">
                  {mangadexMangas.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMangadexFeaturedIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === mangadexFeaturedIndex ? "w-6 bg-purple-500" : "w-2 bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grille MangaDrop */}
            {mangadexLoading && !mangadexLoadingMore ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : mangadexError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">{mangadexError}</p>
                <button onClick={refreshMangadex} className="mt-2 text-purple-400 text-sm hover:text-purple-300 transition-colors flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Réessayer
                </button>
              </div>
            ) : mangadexMangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Globe className="w-16 h-16 text-muted-foreground/30" />
                <p className="text-muted-foreground mt-4 text-sm font-medium">Aucun manga disponible</p>
                <button
                  onClick={refreshMangadex}
                  className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  Charger des mangas
                </button>
              </div>
            ) : (
              <>
                <MangaGrid mangas={mangadexMangas} source="mangadex" loadingMore={mangadexLoadingMore} />
                {hasMoreMangadex && mangadexQuery !== "top" && (
                  <div ref={observerRef} className="flex justify-center py-4">
                    {mangadexLoadingMore ? (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Charger plus...</span>
                    )}
                  </div>
                )}
                {mangadexQuery === "top" && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={refreshMangadex}
                      className="px-6 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-all flex items-center gap-2 border border-border/60"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Charger d'autres mangas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
