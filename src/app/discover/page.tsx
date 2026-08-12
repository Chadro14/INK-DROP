"use client";

import { useState, useEffect, useRef } from "react";
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
  RotateCcw,
  BadgeCheck,
  Globe,
  Library,
  ChevronLeft,
  ChevronRight,
  Star
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

const getImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_URL}/storage/${url}`;
};

export default function DiscoverPage() {
  const router = useRouter();
  const [mangas, setMangas] = useState<any[]>([]);
  const [externalMangas, setExternalMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExternal, setLoadingExternal] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("recent");
  const [activeTab, setActiveTab] = useState<"inkdrop" | "mangadex">("inkdrop");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const genres = ["Action", "Romance", "Horreur", "Sci-Fi", "Mystère", "Aventure", "Comédie"];
  const statuses = ["ONGOING", "COMPLETED", "HIATUS"];
  const sortOptions = [
    { value: "recent", label: "Plus récents" },
    { value: "popular", label: "Les plus populaires" },
    { value: "likes", label: "Les plus aimés" },
  ];

  // FETCH MANGA INKDROP
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

        const res = await fetch(`${API_URL}/mangas?${params}`);
        const data = await res.json();
        setMangas(data.data || []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "inkdrop") {
      fetchMangas();
    }
  }, [search, genre, status, sort, activeTab]);

  // FETCH MANGADEX
  useEffect(() => {
    const fetchExternalMangas = async () => {
      setLoadingExternal(true);
      try {
        const res = await fetch(`${API_URL}/manga-api/search?q=popular&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setExternalMangas(data.data || []);
        } else {
          setExternalMangas([]);
        }
      } catch (error) {
        console.error("Erreur chargement mangas:", error);
        setExternalMangas([]);
      } finally {
        setLoadingExternal(false);
      }
    };

    if (activeTab === "mangadex") {
      fetchExternalMangas();
    }
  }, [activeTab]);

  // CARROUSEL
  useEffect(() => {
    const currentMangas = activeTab === "inkdrop" ? mangas : externalMangas;
    if (currentMangas.length === 0) return;

    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }

    if (isAutoPlaying) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % currentMangas.length);
      }, 3000);
    }

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [mangas.length, externalMangas.length, activeTab, isAutoPlaying]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const nextSlide = () => {
    const currentMangas = activeTab === "inkdrop" ? mangas : externalMangas;
    setCurrentSlide((prev) => (prev + 1) % currentMangas.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    const currentMangas = activeTab === "inkdrop" ? mangas : externalMangas;
    setCurrentSlide((prev) => (prev - 1 + currentMangas.length) % currentMangas.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

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
    setSearchQuery("");
    setGenre("");
    setStatus("");
    setSort("recent");
    router.push("/discover");
    setShowFilters(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      if (activeTab === "inkdrop") {
        const params = new URLSearchParams();
        params.set("search", search);
        if (genre) params.set("genre", genre);
        if (status) params.set("status", status);
        if (sort) params.set("sort", sort);
        router.push(`/discover?${params}`);
      } else {
        setSearchQuery(search);
        const fetchSearch = async () => {
          setLoadingExternal(true);
          try {
            const res = await fetch(`${API_URL}/manga-api/search?q=${encodeURIComponent(search)}&limit=20`);
            if (res.ok) {
              const data = await res.json();
              setExternalMangas(data.data || []);
              setCurrentSlide(0);
            }
          } catch (error) {
            console.error("Erreur recherche:", error);
          } finally {
            setLoadingExternal(false);
          }
        };
        fetchSearch();
      }
    }
  };

  const activeFiltersCount = (genre ? 1 : 0) + (status ? 1 : 0) + (sort !== "recent" ? 1 : 0);

  const MangaCard = ({ manga }: { manga: any }) => {
    const coverUrl = getImageUrl(manga.coverUrl);
    const authorAvatar = getImageUrl(manga.author?.avatarUrl);
    const isCertified = manga.author?.isCertified;
    const badgeColor = manga.author?.badgeColor || "#2563EB";

    return (
      <Link href={`/manga/${manga.id}`} className="group bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col">
        <div className="aspect-[2/3] bg-gradient-to-br from-blue-950/30 to-zinc-900 flex items-center justify-center relative overflow-hidden">
          {coverUrl ? (
            <img src={coverUrl} alt={manga.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <BookOpen className="w-12 h-12 text-zinc-700" />
          )}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
            {manga.genre?.slice(0, 2).map((g: string) => (
              <span key={g} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-950/80 text-blue-300 backdrop-blur-md border border-blue-500/20">{g}</span>
            ))}
          </div>
          <div className="absolute bottom-2 right-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md border ${manga.status === 'ONGOING' ? 'bg-green-950/80 text-green-400 border-green-500/30' : manga.status === 'COMPLETED' ? 'bg-blue-950/80 text-blue-400 border-blue-500/30' : 'bg-yellow-950/80 text-yellow-400 border-yellow-500/30'}`}>
              {manga.status === 'ONGOING' ? 'En cours' : manga.status === 'COMPLETED' ? 'Terminé' : 'En pause'}
            </span>
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <h3 className="text-sm font-bold truncate text-white group-hover:text-blue-400 transition-colors">{manga.title}</h3>
          <div className="flex items-center gap-2">
            {authorAvatar ? (
              <img src={authorAvatar} alt={manga.author?.username || "Auteur"} className="w-5 h-5 rounded-full object-cover border border-zinc-700" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">{manga.author?.username?.charAt(0) || "?"}</div>
            )}
            <p className="text-zinc-400 text-xs truncate font-medium flex items-center gap-1">
              {manga.author?.username || "Inconnu"}
              {isCertified && (<BadgeCheck className="w-4 h-4" fill={badgeColor} color="black" strokeWidth={1.5} />)}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1 text-zinc-400 text-[11px] font-semibold border-t border-zinc-800/60">
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" /> {manga.likesCount || 0}</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-400" /> {manga.viewsCount || 0}</span>
            <span className="flex items-center gap-1">📖 {manga._count?.chapters || 0}</span>
          </div>
        </div>
      </Link>
    );
  };

  const ExternalMangaCard = ({ manga, featured = false }: { manga: any; featured?: boolean }) => {
    return (
      <Link href={`/read/${manga.id}?from=inkmanga`} className={`group bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all ${featured ? "hover:scale-[1.01]" : "hover:scale-[1.02]"} active:scale-[0.98] shadow-lg flex flex-col`}>
        <div className={`${featured ? "aspect-[16/9]" : "aspect-[2/3]"} bg-gradient-to-br from-purple-950/30 to-zinc-900 flex items-center justify-center relative overflow-hidden`}>
          {manga.coverImage ? (
            <img src={manga.coverImage} alt={manga.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <BookOpen className={`${featured ? "w-16 h-16" : "w-12 h-12"} text-zinc-700`} />
          )}
          {featured && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-600/90 text-white backdrop-blur-md border border-purple-400/30">🔥 En vedette</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[90%]">
            {manga.genres?.slice(0, 2).map((g: string) => (
              <span key={g} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-950/80 text-purple-300 backdrop-blur-md border border-purple-500/20">{g}</span>
            ))}
          </div>
          <div className="absolute bottom-2 right-2">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-950/80 text-yellow-400 backdrop-blur-md border border-yellow-500/30 flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400" /> {manga.rating || 'N/A'}
            </span>
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <h3 className={`${featured ? "text-base" : "text-sm"} font-bold truncate text-white group-hover:text-purple-400 transition-colors`}>{manga.title}</h3>
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <span>{manga.author?.name || 'Inconnu'}</span>
            <span>•</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${manga.status === 'ongoing' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : manga.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
              {manga.status === 'ongoing' ? 'En cours' : manga.status === 'completed' ? 'Terminé' : 'En pause'}
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1 text-zinc-400 text-[11px] font-semibold border-t border-zinc-800/60">
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-purple-400" /> MangaDex</span>
            <span className="flex items-center gap-1"><Library className="w-3.5 h-3.5 text-blue-400" /> {manga.chapters || 0} chapitres</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={activeTab === "inkdrop" ? "Rechercher un manga..." : "Rechercher sur MangaDex..."} className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium" />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button type="submit" className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-900/20 shrink-0"><Search className="w-4 h-4" /></button>
          </form>
          <button onClick={() => setShowFilters(true)} className="relative p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all shrink-0" title="Filtres">
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-950">{activeFiltersCount}</span>
            )}
          </button>
          <Link href="/" className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all shrink-0"><X className="w-4 h-4" /></Link>
        </div>
      </header>

      {showFilters && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6 min-h-screen flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-blue-400" /><h2 className="text-lg font-extrabold text-white">Filtres de recherche</h2></div>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Genre</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <button key={g} onClick={() => setGenre(g === genre ? "" : g)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${genre === g ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Statut</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button key={s} onClick={() => setStatus(s === status ? "" : s)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${status === s ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"}`}>{s.toLowerCase()}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trier par</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-blue-500 outline-none transition-all text-sm font-medium">
                  {sortOptions.map((s) => (<option key={s.value} value={s.value} className="bg-zinc-900 text-white">{s.label}</option>))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-zinc-800/80 mt-6">
              <button onClick={applyFilters} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30">Appliquer les filtres</button>
              <button onClick={clearFilters} className="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-sm hover:text-white transition-all flex items-center gap-1.5"><RotateCcw className="w-4 h-4" /> Reset</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 border-b border-zinc-800/60">
        <div className="flex gap-6 max-w-lg mx-auto">
          <button onClick={() => setActiveTab("inkdrop")} className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === "inkdrop" ? "border-blue-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
            <BookOpen className="w-4 h-4" /> INKDROP ({mangas.length})
          </button>
          <button onClick={() => setActiveTab("mangadex")} className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === "mangadex" ? "border-purple-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
            <Globe className="w-4 h-4" /> MangaDex ({externalMangas.length})
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 md:px-8 py-5 max-w-lg mx-auto w-full space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-400" /> {activeTab === "inkdrop" ? "Découvrir" : "MangaDex"}</h1>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">{activeTab === "inkdrop" ? mangas.length : externalMangas.length} résultats</span>
        </div>

          {/* INKDROP */}
        {activeTab === "inkdrop" && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">{[...Array(6)].map((_, i) => (<div key={i} className="aspect-[2/3] bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />))}</div>
            ) : mangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-6">
                <BookOpen className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-400 text-sm font-medium mt-4">Aucun manga ne correspond à votre recherche</p>
                <button onClick={clearFilters} className="mt-4 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/20">Réinitialiser les filtres</button>
              </div>
            ) : (
              <>
                <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/40 shadow-xl" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  <div className="relative h-56 md:h-72 w-full">
                    {mangas.map((manga, index) => (
                      <div key={manga.id} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                        <Link href={`/manga/${manga.id}`} className="block w-full h-full">
                          <div className="w-full h-full relative">
                            {manga.coverUrl ? (
                              <img src={getImageUrl(manga.coverUrl)} alt={manga.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><BookOpen className="w-16 h-16 text-zinc-700" /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/80 text-white border border-blue-400/30">📖 En vedette</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800/80 text-yellow-400 border border-yellow-500/30 flex items-center gap-0.5">❤️ {manga.likesCount || 0}</span>
                              </div>
                              <h2 className="text-xl md:text-2xl font-extrabold text-white">{manga.title}</h2>
                              <p className="text-zinc-300 text-sm mt-1 line-clamp-2 max-w-md">{manga.description || "Découvrez ce manga sur INKDROP."}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                                <span>{manga.author?.username || 'Inconnu'}</span>
                                <span>•</span>
                                <span>{manga._count?.chapters || 0} chapitres</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                    <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md z-20 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md z-20 transition-all"><ChevronRight className="w-5 h-5" /></button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                      {mangas.slice(0, 8).map((_, index) => (
                        <button key={index} onClick={() => goToSlide(index)} className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 bg-blue-500" : "w-1.5 bg-zinc-600/60 hover:bg-zinc-400"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  {mangas.slice(1).map((manga: any) => (<MangaCard key={manga.id} manga={manga} />))}
                </div>
              </>
            )}
          </>
        )}

        {/* MANGADEX */}
        {activeTab === "mangadex" && (
          <>
            {loadingExternal ? (
              <div className="grid grid-cols-2 gap-3">{[...Array(6)].map((_, i) => (<div key={i} className="aspect-[2/3] bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />))}</div>
            ) : externalMangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-6">
                <Globe className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-400 text-sm font-medium mt-4">{searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucun manga disponible"}</p>
                <p className="text-zinc-500 text-xs mt-1">Essayez "Solo Leveling" ou "Boruto"</p>
              </div>
            ) : (
              <>
                <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/40 shadow-xl" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  <div className="relative h-56 md:h-72 w-full">
                    {externalMangas.map((manga, index) => (
                      <div key={manga.id} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                        <Link href={`/read/${manga.id}?from=inkmanga`} className="block w-full h-full">
                          <div className="w-full h-full relative">
                            {manga.coverImage ? (
                              <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><BookOpen className="w-16 h-16 text-zinc-700" /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/80 text-white border border-purple-400/30">🔥 En vedette</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800/80 text-yellow-400 border border-yellow-500/30 flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400" /> {manga.rating || 'N/A'}</span>
                              </div>
                              <h2 className="text-xl md:text-2xl font-extrabold text-white">{manga.title}</h2>
                              <p className="text-zinc-300 text-sm mt-1 line-clamp-2 max-w-md">{manga.description || "Découvrez ce manga sur MangaDex."}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                                <span>{manga.author?.name || 'Inconnu'}</span>
                                <span>•</span>
                                <span>{manga.chapters || 0} chapitres</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                    <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md z-20 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md z-20 transition-all"><ChevronRight className="w-5 h-5" /></button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                      {externalMangas.slice(0, 8).map((_, index) => (
                        <button key={index} onClick={() => goToSlide(index)} className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 bg-purple-500" : "w-1.5 bg-zinc-600/60 hover:bg-zinc-400"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  {externalMangas.slice(1).map((manga: any) => (<ExternalMangaCard key={manga.id} manga={manga} />))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}