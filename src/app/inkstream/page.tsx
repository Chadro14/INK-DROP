"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  Search, 
  Film, 
  Star, 
  X, 
  Sparkles, 
  Tv, 
  Clapperboard,
  Play,
  Flame,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Anime = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  genre: string[];
  rating: number;
  source: string;
  episodesCount: number;
};

// Liste des genres / catégories
const GENRES = [
  "Tous",
  "Tendances",
  "Action",
  "Drame",
  "Comédie",
  "Romance",
  "Aventure",
  "Sci-Fi",
  "Fantasy",
  "Mystère"
];

export default function InkStreamPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("Tous");
  
  // Index du carrousel Hero
  const [heroIndex, setHeroIndex] = useState(0);

  // ============================================
  // RÉCUPÉRER LES ANIMES
  // ============================================
  useEffect(() => {
    const fetchAnimes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);

        const res = await fetch(`${API_URL}/inkstream/search?${params}`);
        const data = await res.json();
        setAnimes(data.data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des animes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [search]);

  // Animes phares pour le carrousel Hero (Top 5)
  const featuredAnimes = animes.slice(0, 5);

  // ============================================
  // DEFILEMENT AUTOMATIQUE DU CARROUSEL (TOUTES LES 3s)
  // ============================================
  useEffect(() => {
    if (featuredAnimes.length <= 1) return;

    const timer = setInterval(() => {
      setHeroIndex((prevIndex) => (prevIndex + 1) % featuredAnimes.length);
    }, 3000); // 3 secondes

    return () => clearInterval(timer);
  }, [featuredAnimes.length]);

  // Filtrage par genre client-side
  const filteredAnimes = animes.filter((anime) => {
    if (selectedGenre === "Tous") return true;
    if (selectedGenre === "Tendances") return anime.rating >= 7.5;
    return anime.genre?.some((g) => 
      g.toLowerCase().includes(selectedGenre.toLowerCase())
    );
  });

  const nextHero = () => {
    setHeroIndex((prev) => (prev + 1) % featuredAnimes.length);
  };

  const prevHero = () => {
    setHeroIndex((prev) => (prev - 1 + featuredAnimes.length) % featuredAnimes.length);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER FIXE MINIMALISTE */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3.5 transition-all">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              InkStream
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                HD
              </span>
            </span>
          </div>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all flex items-center justify-center"
            title="Rechercher"
          >
            {showSearch ? <X className="w-4.5 h-4.5" /> : <Search className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* BARRE DE RECHERCHE DÉROULANTE */}
        {showSearch && (
          <form onSubmit={(e) => e.preventDefault()} className="max-w-6xl mx-auto mt-3 pt-3 border-t border-zinc-800/60 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un anime..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                autoFocus
              />
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6 flex-1 space-y-8">
        
        {/* CARROUSEL HERO AUTOMATIQUE (3 SECONDES) */}
        {!loading && featuredAnimes.length > 0 && !search && (
          <section className="relative w-full rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-900/50 shadow-2xl group">
            {featuredAnimes.map((anime, index) => (
              <div
                key={anime.id}
                className={`transition-opacity duration-700 ease-in-out ${
                  index === heroIndex ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0 pointer-events-none"
                }`}
              >
                <div className="relative h-72 md:h-96 w-full overflow-hidden">
                  {/* Backdrop Cover */}
                  <img
                    src={anime.coverImage}
                    alt={anime.title}
                    className="w-full h-full object-cover object-center scale-105 filter blur-[2px] opacity-40 brightness-75"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent" />

                  {/* Contenu Hero */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex items-end justify-between gap-4">
                    <div className="flex gap-4 md:gap-6 items-end max-w-2xl">
                      {/* Image Poster */}
                      <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="w-24 md:w-36 aspect-[2/3] object-cover rounded-xl shadow-2xl border border-zinc-700/50 shrink-0 hidden sm:block"
                      />

                      <div className="space-y-2">
                        {/* Badge Tendance */}
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                            <Flame className="w-3 h-3 fill-amber-400" />
                            Tendance #{index + 1}
                          </span>
                          {anime.rating > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-bold bg-zinc-900/80 text-amber-400 px-2 py-0.5 rounded-full border border-zinc-800 backdrop-blur-md">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {anime.rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Titre */}
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tight line-clamp-1">
                          {anime.title}
                        </h2>

                        {/* Synopsis court */}
                        <p className="text-xs md:text-sm text-zinc-300 line-clamp-2 font-normal hidden sm:block">
                          {anime.description || "Découvrez cet anime disponible dès maintenant en haute définition sur InkStream."}
                        </p>

                        {/* Bouton Regarder */}
                        <div className="pt-1">
                          <Link
                            href={`/inkstream/${anime.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs md:text-sm transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            Regarder
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* FLÈCHES MANUELLES DE NAVIGATION */}
            <button
              onClick={prevHero}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextHero}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/60 text-zinc-300 hover:text-white border border-zinc-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* INDICATEURS DE SLIDE (DOTS) */}
            <div className="absolute bottom-3 right-5 z-20 flex items-center gap-1.5">
              {featuredAnimes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === heroIndex ? "w-6 bg-blue-500" : "w-1.5 bg-zinc-600/60 hover:bg-zinc-400"
                  }`}
                />
              ))}
            </div>
          </section>
        )}

        {/* RECHERCHE ET RANGES / CATÉGORIES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">Catégories</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 text-xs font-semibold">
              {filteredAnimes.length} {filteredAnimes.length > 1 ? "animes" : "anime"}
            </span>
          </div>

          {/* BARRE DE DÉFILEMENT PAR GENRES */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {GENRES.map((genre) => {
              const active = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                    active
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                      : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {genre === "Tendances" && <Flame className="w-3 h-3 inline mr-1 fill-amber-400 text-amber-400" />}
                  {genre}
                </button>
              );
            })}
          </div>
        </section>

        {/* CONTENU / GRILLE DES ANIMES */}
        <section>
          {loading ? (
            /* SKELETON LOADING */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-[2/3] bg-zinc-900/60 border border-zinc-800/60 rounded-2xl animate-pulse" />
                  <div className="h-4 bg-zinc-900/80 rounded-md w-3/4 animate-pulse" />
                  <div className="h-3 bg-zinc-900/50 rounded-md w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredAnimes.length === 0 ? (
            /* PAS DE RÉSULTAT */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800/40 my-4 max-w-md mx-auto">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 mb-4">
                <Clapperboard className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Aucun anime dans cette catégorie</h3>
              <p className="text-zinc-400 text-xs md:text-sm max-w-xs mb-6">
                {search ? `Aucun résultat pour "${search}".` : `Aucun anime trouvé pour le genre "${selectedGenre}".`}
              </p>
              <button
                onClick={() => {
                  setSelectedGenre("Tous");
                  setSearch("");
                }}
                className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-800 transition-all"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            /* GRILLE DES ANIMES */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {filteredAnimes.map((anime) => (
                <Link
                  key={anime.id}
                  href={`/inkstream/${anime.id}`}
                  className="group flex flex-col bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden hover:scale-[1.02] hover:border-blue-500/50 hover:bg-zinc-900/80 transition-all duration-200 shadow-lg"
                >
                  {/* IMAGE COVER */}
                  <div className="aspect-[2/3] bg-zinc-900 relative overflow-hidden">
                    {anime.coverImage ? (
                      <img 
                        src={anime.coverImage} 
                        alt={anime.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 p-2 text-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                        <Film className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium">Pas d'image</span>
                      </div>
                    )}

                    {/* RATING BADGE */}
                    {anime.rating > 0 && (
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-black bg-zinc-950/80 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full backdrop-blur-md shadow-md">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {anime.rating.toFixed(1)}
                      </span>
                    )}

                    {/* BADGES GENRES */}
                    {anime.genre && anime.genre.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 pointer-events-none">
                        {anime.genre.slice(0, 2).map((g: string) => (
                          <span 
                            key={g} 
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-zinc-950/80 text-zinc-300 border border-zinc-800/80 backdrop-blur-md truncate max-w-[80px]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* INFOS */}
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {anime.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-zinc-400 text-[11px]">
                      <span className="flex items-center gap-1 text-zinc-500 font-medium">
                        <Tv className="w-3 h-3 text-blue-400" />
                        {anime.episodesCount || 0} épisodes
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* BOTTOM NAV */}
      <BottomNav />
    </div>
  );
}
