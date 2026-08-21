"use client";

import { useState, useEffect } from "react";
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
  Flame,
  TrendingUp,
  Users,
  Globe,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Crown,
  User,
  Calendar,
  Tag,
  Sparkles
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
};

export default function DiscoverPage() {
  const router = useRouter();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const genres = [
    "Action", "Aventure", "Comédie", "Drame", "Fantastique",
    "Horreur", "Mystère", "Romance", "Science-fiction", "Surnaturel",
    "Tranche de vie", "Thriller"
  ];

  // ============================================
  // RÉCUPÉRER LES MANGAS
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
        setMangas(data.data || []);
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

  const handleMangaClick = (mangaId: string) => {
    router.push(`/manga/${mangaId}`);
  };

  if (loading) {
    return <Loader message="Chargement des mangas" />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="text-base font-bold tracking-tight text-white/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Découvrir
          </span>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        {showSearch && (
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mt-3 flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un manga..."
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
      </header>

      {/* CONTENU */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">

        {error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
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
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-16 h-16 text-zinc-700" />
            <p className="text-zinc-400 mt-4 text-center">
              {search || selectedGenre
                ? "Aucun résultat pour cette recherche"
                : "Aucun manga disponible pour le moment"}
            </p>
            {(search || selectedGenre) && (
              <button
                onClick={clearSearch}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
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
                    <div className="absolute top-1.5 left-1.5 flex gap-1">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-600/80 text-white border border-blue-400/30">
                        {manga.genre?.[0] || "Manga"}
                      </span>
                      {manga.source === "mangadex" && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-600/80 text-white border border-purple-400/30 flex items-center gap-0.5">
                          <Globe className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-sm font-bold truncate text-white group-hover:text-blue-400 transition-colors">
                      {manga.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-zinc-500 text-[10px] truncate flex items-center gap-0.5">
                        {manga.author?.username || "Inconnu"}
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
                      {manga.source === "mangadex" && manga.language && (
                        <span className="text-zinc-500 text-[9px]">
                          {manga.language}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-zinc-400">
                  Page {currentPage} / {totalPages}
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
      </main>

      <BottomNav />
    </div>
  );
}
