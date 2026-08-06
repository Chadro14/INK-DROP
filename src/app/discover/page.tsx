"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  Heart, 
  Eye, 
  Search, 
  SlidersHorizontal, 
  X, 
  BookOpen, 
  Sparkles,
  RotateCcw
} from "lucide-react";

const IconManga = () => (
  <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-blue-400 shadow-inner">
    <BookOpen className="w-7 h-7" />
  </div>
);

export default function DiscoverPage() {
  const router = useRouter();
  const [mangas, setMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("recent");

  const genres = ["Action", "Romance", "Horreur", "Sci-Fi", "Mystère", "Aventure", "Comédie"];
  const statuses = ["ONGOING", "COMPLETED", "HIATUS"];
  const sortOptions = [
    { value: "recent", label: "Plus récents" },
    { value: "popular", label: "Les plus populaires" },
    { value: "likes", label: "Les plus aimés" },
  ];

  // ============================================
  // FETCH
  // ============================================
  useEffect(() => {
    const fetchMangas = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "20",
          ...(search && { search }),
          ...(genre && { genre }),
          ...(status && { status }),
          ...(sort && { sort }),
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/mangas?${params}`
        );
        const data = await res.json();
        setMangas(data.data || []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, [search, genre, status, sort]);

  // ============================================
  // APPLIQUER FILTRES
  // ============================================
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (genre) params.set("genre", genre);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    router.push(`/discover?${params}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearch("");
    setGenre("");
    setStatus("");
    setSort("recent");
    router.push("/discover");
    setShowFilters(false);
  };

  // ============================================
  // HANDLE SEARCH
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const params = new URLSearchParams();
      params.set("search", search);
      if (genre) params.set("genre", genre);
      if (status) params.set("status", status);
      if (sort) params.set("sort", sort);
      router.push(`/discover?${params}`);
    }
  };

  const activeFiltersCount = (genre ? 1 : 0) + (status ? 1 : 0) + (sort !== "recent" ? 1 : 0);

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un manga..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md shadow-blue-900/20 shrink-0"
            >
              Chercher
            </button>
          </form>

          <button
            onClick={() => setShowFilters(true)}
            className="relative p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all shrink-0"
            title="Filtres"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-950">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <Link 
            href="/" 
            className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ===== FILTRES (Overlay Modernisé) ===== */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6 min-h-screen flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-extrabold text-white">Filtres de recherche</h2>
                </div>
                <button 
                  onClick={() => setShowFilters(false)} 
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Genre
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g === genre ? "" : g)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        genre === g
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Statut
                </label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s === status ? "" : s)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        status === s
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      {s.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tri */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Trier par
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-blue-500 outline-none transition-all text-sm font-medium"
                >
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value} className="bg-zinc-900 text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Boutons d'action Modal */}
            <div className="flex gap-3 pt-6 border-t border-zinc-800/80 mt-6">
              <button
                onClick={applyFilters}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30"
              >
                Appliquer les filtres
              </button>
              <button
                onClick={clearFilters}
                className="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-sm hover:text-white transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RÉSULTATS ===== */}
      <main className="flex-1 px-4 md:px-8 py-5 max-w-lg mx-auto w-full space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Découvrir
          </h1>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            {mangas.length} {mangas.length > 1 ? "résultats" : "résultat"}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-[2/3] bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" 
              />
            ))}
          </div>
        ) : mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-6">
            <IconManga />
            <p className="text-zinc-400 text-sm font-medium mt-4">Aucun manga ne correspond à votre recherche</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/20"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {mangas.map((manga: any) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col justify-between"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-blue-950/30 to-zinc-900 flex items-center justify-center relative overflow-hidden">
                  <IconManga />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
                    {manga.genre?.slice(0, 2).map((g: string) => (
                      <span 
                        key={g} 
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-950/80 text-blue-300 backdrop-blur-md border border-blue-500/20"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <h3 className="text-sm font-bold truncate text-white group-hover:text-blue-400 transition-colors">
                    {manga.title}
                  </h3>
                  <p className="text-zinc-500 text-xs truncate font-medium">
                    {manga.author?.username || "Inconnu"}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-1 text-zinc-400 text-[11px] font-semibold border-t border-zinc-800/60">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" /> 
                      {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-400" /> 
                      {manga.viewsCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
