"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Heart, Eye, Search, Filter, X } from "lucide-react";

const IconManga = () => (
  <svg className="w-8 h-8 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="7" y1="7" x2="17" y2="7" />
    <line x1="7" y1="11" x2="17" y2="11" />
    <line x1="7" y1="15" x2="13" y2="15" />
  </svg>
);

export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mangas, setMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "recent");

  const genres = ["Action", "Romance", "Horreur", "Sci-Fi", "Mystère", "Aventure", "Comédie"];
  const statuses = ["ONGOING", "COMPLETED", "HIATUS"];
  const sortOptions = [
    { value: "recent", label: "Plus récents" },
    { value: "popular", label: "Les plus populaires" },
    { value: "likes", label: "Les plus aimés" },
  ];

  useEffect(() => {
    const fetchMangas = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
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
        setTotalPages(data.meta?.totalPages || 1);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMangas();
  }, [page, search, genre, status, sort]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (genre) params.set("genre", genre);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    router.push(`/discover?${params}`);
    setShowFilters(false);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setGenre("");
    setStatus("");
    setSort("recent");
    router.push("/discover");
    setPage(1);
    setShowFilters(false);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">

      {/* ===== HEADER SANS LOGO ===== */}
      <header className="sticky top-0 z-40 bg-ink-bg/80 backdrop-blur-sm border-b border-ink-border px-4 py-3">
        <div className="flex items-center justify-end max-w-lg mx-auto gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-ink-muted hover:text-white transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
          <Link href="/" className="text-ink-muted hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* ===== FILTRES ===== */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-ink-bg/95 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Filtres</h2>
              <button onClick={() => setShowFilters(false)} className="text-ink-muted hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="text-ink-muted text-xs font-medium uppercase tracking-wider">Recherche</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Titre du manga..."
                className="w-full mt-1 px-4 py-2 rounded-lg bg-ink-card border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="text-ink-muted text-xs font-medium uppercase tracking-wider">Genre</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g === genre ? "" : g)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      genre === g
                        ? "bg-accent text-white"
                        : "bg-ink-card border border-ink-border text-ink-muted hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-ink-muted text-xs font-medium uppercase tracking-wider">Statut</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s === status ? "" : s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      status === s
                        ? "bg-accent text-white"
                        : "bg-ink-card border border-ink-border text-ink-muted hover:text-white"
                    }`}
                  >
                    {s.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-ink-muted text-xs font-medium uppercase tracking-wider">Trier par</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-ink-card border border-ink-border text-white focus:border-accent outline-none transition-colors"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark transition-colors"
              >
                Appliquer
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-lg bg-ink-card border border-ink-border text-ink-muted font-semibold hover:text-white transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RÉSULTATS ===== */}
      <main className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Découvrir</h1>
          <span className="text-ink-muted text-sm">{mangas.length} résultats</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-ink-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <IconManga />
            <p className="text-ink-muted mt-4">Aucun manga trouvé</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {mangas.map((manga) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="bg-ink-card border border-ink-border rounded-xl overflow-hidden hover:border-accent transition-all active:scale-[0.97]"
                >
                  <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center relative">
                    <IconManga />
                    <div className="absolute top-2 left-2 flex gap-1">
                      {manga.genre?.slice(0, 2).map((g: string) => (
                        <span key={g} className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-semibold truncate text-white">{manga.title}</h3>
                    <p className="text-ink-muted text-[10px] truncate">{manga.author?.username || "Inconnu"}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-ink-muted text-[10px]">
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-3 h-3 text-accent" /> {manga.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3 text-accent" /> {manga.viewsCount || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-ink-card border border-ink-border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent transition-colors text-white"
                >
                  Précédent
                </button>
                <span className="text-ink-muted text-sm px-4">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-ink-card border border-ink-border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent transition-colors text-white"
                >
                  Suivant
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