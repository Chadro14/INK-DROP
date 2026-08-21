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
  Filter,
  RefreshCw,
  Library,
  Clock,
  TrendingUp,
  Flame,
  Star,
  Crown
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
};

export default function DiscoverPage() {
  const router = useRouter();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [mangadexMangas, setMangadexMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMangadex, setLoadingMangadex] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  
  // MangaDrop states
  const [mangadexQuery, setMangadexQuery] = useState("");
  const [mangadexSearch, setMangadexSearch] = useState("");
  const [mangadexPage, setMangadexPage] = useState(1);
  const [mangadexTotalPages, setMangadexTotalPages] = useState(1);
  const [loadingMangadexMore, setLoadingMangadexMore] = useState(false);
  const [hasMoreMangadex, setHasMoreMangadex] = useState(true);
  const [showMangadexSearch, setShowMangadexSearch] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const genres = [
    "Action", "Aventure", "Comédie", "Drame", "Fantastique",
    "Horreur", "Mystère", "Romance", "Science-fiction", "Surnaturel",
    "Tranche de vie", "Thriller"
  ];

  // ============================================
  // RÉCUPÉRER LES MANGAS INKDROP
  // ============================================
  useEffect(() => {
    const fetchMangas = async () => {
      setLoading(true);
      setError("");
      try {
        let url = `${API_URL}/mangas?page=${currentPage}&limit=20`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        if (selectedGenre) {
          url += `&genre=${encodeURIComponent(selectedGenre)}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des mangas");
        }

        const data = await res.json();
        const inkdropMangas = (data.data || []).map((m: any) => ({
          ...m,
          source: "inkdrop" as const
        }));
        setMangas(inkdropMangas);
        setTotalPages(data.lastPage || 1);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
        setMangas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, [currentPage, search, selectedGenre]);

  // ============================================
  // RÉCUPÉRER LES MANGAS MANGADROP
  // ============================================
  const fetchMangadex = async (query: string, page: number = 1) => {
    if (!query) return;
    
    setLoadingMangadex(true);
    try {
      const langParam = "&availableTranslatedLanguage[]=fr&availableTranslatedLanguage[]=en";
      const res = await fetch(
        `${API_URL}/manga-api/search?q=${encodeURIComponent(query)}&limit=20&page=${page}${langParam}`
      );
      
      if (!res.ok) {
        throw new Error("Erreur lors de la recherche MangaDrop");
      }

      const data = await res.json();
      const mangadexData = (data.data || []).map((m: any) => ({
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
        chapters: m.chapters || 0
      }));

      if (page === 1) {
        setMangadexMangas(mangadexData);
      } else {
        setMangadexMangas(prev => [...prev, ...mangadexData]);
      }
      
      setMangadexTotalPages(data.lastPage || 1);
      setHasMoreMangadex(mangadexData.length > 0 && page < (data.lastPage || 1));
      setMangadexPage(page);
    } catch (err: any) {
      console.error("Erreur MangaDrop:", err);
    } finally {
      setLoadingMangadex(false);
      setLoadingMangadexMore(false);
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
      setShowMangadexSearch(false);
    }
  };

  // ============================================
  // INFINITE SCROLL MANGADROP
  // ============================================
  useEffect(() => {
    if (!mangadexQuery) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMangadex && !loadingMangadexMore && !loadingMangadex) {
          setLoadingMangadexMore(true);
          fetchMangadex(mangadexQuery, mangadexPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [mangadexQuery, mangadexPage, hasMoreMangadex, loadingMangadexMore, loadingMangadex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setShowSearch(false);
  };

  const clearSearch = () => {
    setSearch("");
    setSelectedGenre("");
    setCurrentPage(1);
    setShowSearch(false);
  };

  const clearMangadexSearch = () => {
    setMangadexSearch("");
    setMangadexQuery("");
    setMangadexMangas([]);
    setHasMoreMangadex(true);
  };

  const handleMangaClick = (mangaId: string, source?: string) => {
    if (source === "mangadex") {
      router.push(`/read/${mangaId}`);
    } else {
      router.push(`/manga/${mangaId}`);
    }
  };

  if (loading) {
    return <Loader message="Chargement des mangas" />;
  }

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
            <button
              onClick={() => setShowMangadexSearch(!showMangadexSearch)}
              className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium hidden sm:inline">MangaDrop</span>
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RECHERCHE INKDROP */}
        {showSearch && (
          <form onSubmit={handleSearch} className="max-w-6xl mx-auto mt-3 flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un manga INKDROP..."
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
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGenre("")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedGenre === ""
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Tous
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre === selectedGenre ? "" : genre);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedGenre === genre
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {(search || selectedGenre) && (
              <button
                onClick={clearSearch}
                className="text-xs text-zinc-500 hover:text-white transition-colors text-left"
              >
                Effacer les filtres
              </button>
            )}
          </form>
        )}

        {/* RECHERCHE MANGADROP */}
        {showMangadexSearch && (
          <form onSubmit={handleMangadexSearch} className="max-w-6xl mx-auto mt-3 flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={mangadexSearch}
                  onChange={(e) => setMangadexSearch(e.target.value)}
                  placeholder="Rechercher sur MangaDrop (MangaDex)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-purple-800/50 text-white placeholder-zinc-500 focus:border-purple-500 outline-none transition-all text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setShowMangadexSearch(false)}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {mangadexQuery && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400">
                  Résultats pour "{mangadexQuery}"
                </span>
                <button
                  onClick={clearMangadexSearch}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Effacer
                </button>
              </div>
            )}
          </form>
        )}
      </header>

      {/* CONTENU */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">

        {/* SECTION INKDROP */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Library className="w-4 h-4 text-blue-400" />
              INKDROP
            </h2>
            <span className="text-xs text-zinc-500">{mangas.length} mangas</span>
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-zinc-400 text-center">{error}</p>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setSearch("");
                  setSelectedGenre("");
                }}
                className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
              >
                Réessayer
              </button>
            </div>
          ) : mangas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <BookOpen className="w-12 h-12 text-zinc-700" />
              <p className="text-zinc-400 mt-3 text-center text-sm">
                {search || selectedGenre
                  ? "Aucun résultat pour cette recherche"
                  : "Aucun manga INKDROP disponible"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {mangas.map((manga) => (
                  <div
                    key={manga.id}
                    onClick={() => handleMangaClick(manga.id)}
                    className="group bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all active:scale-[0.97] cursor-pointer"
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
                      <div className="absolute top-1.5 left-1.5">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-600/80 text-white border border-blue-400/30">
                          {manga.genre?.[0] || "Manga"}
                        </span>
                      </div>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION INKDROP */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-zinc-400">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* SECTION MANGADROP */}
        {mangadexQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                MangaDrop
              </h2>
              <span className="text-xs text-purple-400">
                {mangadexMangas.length} résultats
              </span>
            </div>

            {loadingMangadex ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : mangadexMangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Globe className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-400 mt-3 text-center text-sm">
                  Aucun résultat sur MangaDrop
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {mangadexMangas.map((manga) => (
                    <div
                      key={manga.id}
                      onClick={() => handleMangaClick(manga.id, "mangadex")}
                      className="group bg-zinc-900/40 border border-purple-800/40 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all active:scale-[0.97] cursor-pointer"
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
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-600/80 text-white border border-purple-400/30 flex items-center gap-0.5">
                            <Globe className="w-3 h-3" />
                          </span>
                          {manga.rating && manga.rating > 0 && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white border border-white/20 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              {manga.rating}
                            </span>
                          )}
                        </div>
                        {manga.language && (
                          <div className="absolute bottom-1.5 right-1.5">
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white border border-white/20">
                              {manga.language}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-sm font-bold truncate text-white group-hover:text-purple-400 transition-colors">
                          {manga.title}
                        </h4>
                        <p className="text-zinc-500 text-[10px] truncate">
                          {manga.author?.username || "Inconnu"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-zinc-500 text-[10px]">
                          {manga.chapters && manga.chapters > 0 && (
                            <span className="flex items-center gap-0.5">
                              <BookOpen className="w-3 h-3 text-purple-400" />
                              {manga.chapters} chapitres
                            </span>
                          )}
                          <span className="text-zinc-600 text-[9px]">•</span>
                          <span className="text-purple-400/70 text-[9px]">MangaDrop</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* INFINITE SCROLL MANGADROP */}
                {hasMoreMangadex && (
                  <div ref={observerRef} className="flex justify-center py-4">
                    {loadingMangadexMore ? (
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-xs text-zinc-500">Charger plus...</span>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
