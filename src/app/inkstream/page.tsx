"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Search, Film, Star, Eye, X } from "lucide-react";

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
  uploader?: {
    username: string;
    full_name: string;
  };
};

export default function InkStreamPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

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
        console.error("Erreur:", error);
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
    <div className="flex flex-col min-h-screen pb-20 bg-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-black" />
            <span className="text-lg font-bold text-black">InkStream</span>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-gray-500 hover:text-black transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {showSearch && (
          <form onSubmit={handleSearch} className="mt-3 flex items-center gap-2 animate-fade-in">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un anime..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-black outline-none transition-colors"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearch("");
              }}
              className="text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        )}
      </header>

      {/* RÉSULTATS */}
      <main className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-black">Animes</h1>
          <span className="text-gray-400 text-sm">{animes.length} résultats</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : animes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Film className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 mt-4">Aucun anime trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Essayez une autre recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {animes.map((anime) => (
              <Link
                key={anime.id}
                href={`/inkstream/${anime.id}`}
                className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-black transition-all active:scale-[0.97]"
              >
                <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center relative">
                  <Film className="w-8 h-8 text-gray-400" />
                  {anime.rating && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 text-xs font-bold bg-black/60 text-yellow-400 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {anime.rating.toFixed(1)}
                    </span>
                  )}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {anime.genre?.slice(0, 2).map((g: string) => (
                      <span key={g} className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-semibold truncate text-black">{anime.title}</h3>
                  <p className="text-gray-400 text-[10px] truncate">
                    {anime.uploader?.full_name || anime.uploader?.username || "Source inconnue"}
                  </p>
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