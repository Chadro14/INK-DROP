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
  Layers, 
  Clapperboard 
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

export default function InkStreamPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSearch(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER FIXE MINIMALISTE ET BLUR */}
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
          <form onSubmit={handleSearch} className="max-w-6xl mx-auto mt-3 pt-3 border-t border-zinc-800/60 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un anime, un genre..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shrink-0"
            >
              OK
            </button>
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
      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6 flex-1">
        
        {/* TITRE DE SECTION ET COMPTEUR */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Catalogue Streaming</h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 text-xs font-semibold backdrop-blur-md">
            {animes.length} {animes.length > 1 ? "résultats" : "résultat"}
          </span>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[2/3] bg-zinc-900/60 border border-zinc-800/60 rounded-2xl animate-pulse" />
                <div className="h-4 bg-zinc-900/80 rounded-md w-3/4 animate-pulse" />
                <div className="h-3 bg-zinc-900/50 rounded-md w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : animes.length === 0 ? (
          
          /* AUCUN RÉSULTAT FOUND */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800/40 my-4 max-w-md mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 mb-4">
              <Clapperboard className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Aucun anime trouvé</h3>
            <p className="text-zinc-400 text-xs md:text-sm max-w-xs mb-6">
              {search ? `Aucun résultat pour "${search}". Essayez avec un autre mot-clé.` : "Aucun anime n'est disponible pour le moment."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-800 transition-all"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          
          /* GRILLE DES ANIMES MODERNE */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {animes.map((anime) => (
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

                  {/* BADGE NOTE / RATING */}
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

                {/* INFOS TEXTE */}
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
      </main>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </div>
  );
}
