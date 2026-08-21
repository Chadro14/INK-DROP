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

export default function DiscoverPage() {
  const router = useRouter();
  
  // ===== ONGLET ACTIF =====
  const [activeTab, setActiveTab] = useState<"inkdrop" | "mangadex">("inkdrop");
  
  // ===== ÉTATS INKDROP =====
  const [inkdropMangas, setInkdropMangas] = useState<Manga[]>([]);
  const [inkdropLoading, setInkdropLoading] = useState(true);
  const [inkdropError, setInkdropError] = useState("");
  const [inkdropSearch, setInkdropSearch] = useState("");
  const [inkdropShowSearch, setInkdropShowSearch] = useState(false);
  const [inkdropGenre, setInkdropGenre] = useState("");
  const [inkdropPage, setInkdropPage] = useState(1);
  const [inkdropTotalPages, setInkdropTotalPages] = useState(1);
  
  // ===== ÉTATS MANGADROP =====
  const [mangadexMangas, setMangadexMangas] = useState<Manga[]>([]);
  const [mangadexLoading, setMangadexLoading] = useState(false);
  const [mangadexError, setMangadexError] = useState("");
  const [mangadexSearch, setMangadexSearch] = useState("");
  const [mangadexShowSearch, setMangadexShowSearch] = useState(false);
  const [mangadexPage, setMangadexPage] = useState(1);
  const [hasMoreMangadex, setHasMoreMangadex] = useState(true);
  const [mangadexQuery, setMangadexQuery] = useState("");
  const [mangadexLoadingMore, setMangadexLoadingMore] = useState(false);
  
  // ===== VITRINE AUTO =====
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
  const fetchMangadex = async (query: string, page: number = 1) => {
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
    } catch (err: any) {
      setMangadexError(err.message);
    } finally {
      setMangadexLoading(false);
      setMangadexLoadingMore(false);
    }
  };

  // ============================================
  // RECHERCHE MANGADROP
  // ============================================
  const handleMangadexSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mangadexSearch.trim()) {
      setMangadexQuery(mangadexSearch);
      setMangadexPage(1);
      fetchMangadex(mangadexSearch, 1);
      setMangadexShowSearch(false);
    }
  };

  // ============================================
  // INFINITE SCROLL MANGADROP
  // ============================================
  useEffect(() => {
    if (!mangadexQuery || activeTab !== "mangadex") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMangadex && !mangadexLoadingMore && !mangadexLoading) {
          setMangadexLoadingMore(true);
          fetchMangadex(mangadexQuery, mangadexPage + 1);
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
      }, 3000);
    }
    return () => {
      if (inkdropIntervalRef.current) clearInterval(inkdropIntervalRef.current);
    };
  }, [inkdropMangas, activeTab]);

  useEffect(() => {
    if (mangadexMangas.length > 0 && activeTab === "mangadex") {
      mangadexIntervalRef.current = setInterval(() => {
        setMangadexFeaturedIndex((prev) => (prev + 1) % mangadexMangas.length);
      }, 3000);
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
  };

  const getFeaturedManga = (mangas: Manga[], index: number) => {
    if (mangas.length === 0) return null;
    return mangas[index % mangas.length];
  };

  // ============================================
  // COMPOSANT VITRINE
  // ============================================
  const FeaturedCard = ({ manga, source }: { manga: Manga | null; source: "inkdrop" | "mangadex" }) => {
    if (!manga) return null;
    const isInkdrop = source === "inkdrop";
    const borderColor = isInkdrop ? "border-blue-500/30" : "border-purple-500/30";
    const bgGradient = isInkdrop 
      ? "from-blue-950/40 to-zinc-950" 
      : "from-purple-950/40 to-zinc-950";

    return (
      <div 
        onClick={() => handleMangaClick(manga.id, source)}
        className={`relative cursor-pointer rounded-2xl overflow-hidden border ${borderColor} bg-gradient-to-br ${bgGradient} transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-${isInkdrop ? 'blue' : 'purple'}-900/10`}
      >
        <div className="flex h-40 md:h-48">
          <div className="w-1/3 md:w-2/5 h-full">
            {manga.coverUrl ? (
              <img 
                src={manga.coverUrl} 
                alt={manga.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <BookOpen className="w-8 h-8 text-zinc-700" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isInkdrop ? 'bg-blue-600/80' : 'bg-purple-600/80'} text-white border ${isInkdrop ? 'border-blue-400/30' : 'border-purple-400/30'}`}>
                  {isInkdrop ? 'INKDROP' : 'MangaDrop'}
                </span>
                {manga.rating && manga.rating > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white border border-white/20 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {manga.rating}
                  </span>
                )}
              </div>
              <h3 className="text-base md:text-lg font-bold text-white mt-1 line-clamp-1">{manga.title}</h3>
              <p className="text-zinc-400 text-xs line-clamp-2 mt-0.5">
                {manga.author?.username || "Inconnu"}
              </p>
              {manga.genre && manga.genre.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {manga.genre.slice(0, 2).map((g) => (
                    <span key={g} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-400">
                      {g}
                    </span>
                  ))}
                  {manga.genre.length > 2 && (
                    <span className="text-[9px] text-zinc-500">+{manga.genre.length - 2}</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                  {manga.likesCount || 0}
                </span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3 text-blue-400" />
                  {manga.viewsCount || 0}
                </span>
                {manga.chapters && manga.chapters > 0 && (
                  <span className="flex items-center gap-0.5 text-purple-400">
                    <BookOpen className="w-3 h-3" />
                    {manga.chapters}
                  </span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // COMPOSANT GRILLE
  // ============================================
  const MangaGrid = ({ mangas, source, loadingMore }: { mangas: Manga[]; source: "inkdrop" | "mangadex"; loadingMore?: boolean }) => {
    const isInkdrop = source === "inkdrop";
    const borderColor = isInkdrop ? "hover:border-blue-500/50" : "hover:border-purple-500/50";
    const badgeColor = isInkdrop ? "bg-blue-600/80" : "bg-purple-600/80";

    if (mangas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="w-12 h-12 text-zinc-700" />
          <p className="text-zinc-400 mt-3 text-sm">
            {isInkdrop ? "Aucun manga INKDROP disponible" : "Aucun résultat sur MangaDrop"}
          </p>
          {!isInkdrop && !mangadexQuery && (
            <button
              onClick={() => setMangadexShowSearch(true)}
              className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
            >
              Rechercher sur MangaDrop
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {mangas.map((manga) => (
          <div
            key={manga.id}
            onClick={() => handleMangaClick(manga.id, source)}
            className={`group bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden ${borderColor} transition-all active:scale-[0.97] cursor-pointer`}
          >
            <div className="aspect-[2/3] bg-zinc-900 flex items-center justify-center relative overflow-hidden">
              {manga.coverUrl ? (
                <img
                  src={manga.coverUrl}
                  alt={manga.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <BookOpen className="w-8 h-8 text-zinc-700" />
              )}
              <div className="absolute top-1.5 left-1.5 flex gap-1">
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${badgeColor} text-white border ${isInkdrop ? 'border-blue-400/30' : 'border-purple-400/30'}`}>
                  {isInkdrop ? 'INKDROP' : 'MangaDrop'}
                </span>
                {manga.source === "mangadex" && manga.rating && manga.rating > 0 && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white border border-white/20 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {manga.rating}
                  </span>
                )}
              </div>
              {manga.source === "mangadex" && manga.language && (
                <div className="absolute bottom-1.5 right-1.5">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white border border-white/20">
                    {manga.language}
                  </span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <h4 className="text-sm font-bold truncate text-white group-hover:text-blue-400 transition-colors">
                {manga.title}
              </h4>
              <p className="text-zinc-500 text-[10px] truncate">
                {manga.author?.username || "Inconnu"}
              </p>
              <div className="flex items-center gap-3 mt-1 text-zinc-500 text-[10px]">
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                  {manga.likesCount || 0}
                </span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3 text-blue-400" />
                  {manga.viewsCount || 0}
                </span>
                {manga.source === "mangadex" && manga.chapters && manga.chapters > 0 && (
                  <span className="text-purple-400 text-[9px]">
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
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <span className="text-base font-bold tracking-tight text-white/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Découvrir
          </span>
          <div className="flex items-center gap-2">
            {activeTab === "mangadex" && (
              <button
                onClick={() => setMangadexShowSearch(!mangadexShowSearch)}
                className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            {activeTab === "inkdrop" && (
              <button
                onClick={() => setInkdropShowSearch(!inkdropShowSearch)}
                className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900"
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                autoFocus
              />
              <button
                onClick={() => { setInkdropPage(1); setInkdropShowSearch(false); }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
              >
                OK
              </button>
              <button
                onClick={() => setInkdropShowSearch(false)}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInkdropGenre("")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${inkdropGenre === "" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
              >
                Tous
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => { setInkdropGenre(genre === inkdropGenre ? "" : genre); setInkdropPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${inkdropGenre === genre ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {(inkdropSearch || inkdropGenre) && (
              <button onClick={clearInkdropSearch} className="text-xs text-zinc-500 hover:text-white text-left">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/50 text-white placeholder-zinc-500 focus:border-purple-500 outline-none transition-all text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                onClick={handleMangadexSearch}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
              >
                OK
              </button>
              <button
                onClick={() => setMangadexShowSearch(false)}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {mangadexQuery && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400">Résultats pour "{mangadexQuery}"</span>
                <button onClick={clearMangadexSearch} className="text-xs text-zinc-500 hover:text-white">
                  Effacer
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ===== ONGLETS ===== */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-4">
        <div className="flex gap-2 bg-zinc-900/40 p-1 rounded-xl border border-zinc-800/60">
          <button
            onClick={() => setActiveTab("inkdrop")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "inkdrop"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
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
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
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
          <div className="space-y-4">
            {/* Vitrine INKDROP */}
            {featuredInkdrop && (
              <div className="animate-fade-in">
                <FeaturedCard manga={featuredInkdrop} source="inkdrop" />
                <div className="flex justify-center gap-1 mt-2">
                  {inkdropMangas.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInkdropFeaturedIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === inkdropFeaturedIndex ? "w-4 bg-blue-500" : "w-2 bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grille INKDROP */}
            {inkdropError ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 text-sm">{inkdropError}</p>
                <button onClick={() => { setInkdropPage(1); setInkdropSearch(""); setInkdropGenre(""); }} className="mt-2 text-blue-400 text-sm">
                  Réessayer
                </button>
              </div>
            ) : (
              <>
                <MangaGrid mangas={inkdropMangas} source="inkdrop" />
                {inkdropTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => setInkdropPage(p => Math.max(1, p - 1))}
                      disabled={inkdropPage === 1}
                      className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-zinc-400 hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-zinc-400">{inkdropPage} / {inkdropTotalPages}</span>
                    <button
                      onClick={() => setInkdropPage(p => Math.min(inkdropTotalPages, p + 1))}
                      disabled={inkdropPage === inkdropTotalPages}
                      className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-zinc-400 hover:text-white disabled:opacity-50"
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
          <div className="space-y-4">
            {/* Vitrine MangaDrop */}
            {mangadexQuery && featuredMangadex && (
              <div className="animate-fade-in">
                <FeaturedCard manga={featuredMangadex} source="mangadex" />
                <div className="flex justify-center gap-1 mt-2">
                  {mangadexMangas.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMangadexFeaturedIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === mangadexFeaturedIndex ? "w-4 bg-purple-500" : "w-2 bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grille MangaDrop */}
            {!mangadexQuery ? (
              <div className="flex flex-col items-center justify-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
                <Globe className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-400 mt-3 text-sm">Recherchez des mangas sur MangaDrop</p>
                <button
                  onClick={() => setMangadexShowSearch(true)}
                  className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  Rechercher
                </button>
              </div>
            ) : mangadexLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : mangadexError ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 text-sm">{mangadexError}</p>
                <button onClick={() => fetchMangadex(mangadexQuery, 1)} className="mt-2 text-purple-400 text-sm">
                  Réessayer
                </button>
              </div>
            ) : mangadexMangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Globe className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-400 mt-3 text-sm">Aucun résultat pour "{mangadexQuery}"</p>
              </div>
            ) : (
              <>
                <MangaGrid mangas={mangadexMangas} source="mangadex" loadingMore={mangadexLoadingMore} />
                {hasMoreMangadex && (
                  <div ref={observerRef} className="flex justify-center py-4">
                    {mangadexLoadingMore ? (
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-xs text-zinc-500">Charger plus...</span>
                    )}
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
