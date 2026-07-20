"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Search, Film, Star, Eye, X } from "lucide-react";

// ============================================
// TYPES
// ============================================
type Anime = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  genre: string[];
  rating: number;
  uploader?: {
    username: string;
    full_name: string;
  };
};

// ============================================
// DONNÉES MOCK (fallback)
// ============================================
const mockAnimes: Anime[] = [
  { id: '1', title: 'Naruto', description: 'L\'histoire d\'un jeune ninja', coverImage: '', genre: ['Action', 'Aventure'], rating: 4.8 },
  { id: '2', title: 'Demon Slayer', description: 'La chasse aux démons', coverImage: '', genre: ['Action', 'Fantastique'], rating: 4.9 },
  { id: '3', title: 'One Piece', description: 'La quête du trésor ultime', coverImage: '', genre: ['Action', 'Comédie'], rating: 4.7 },
  { id: '4', title: 'Attack on Titan', description: 'La lutte pour la survie', coverImage: '', genre: ['Action', 'Drame'], rating: 4.6 },
  { id: '5', title: 'My Hero Academia', description: 'Le monde des super-héros', coverImage: '', genre: ['Action', 'Sci-Fi'], rating: 4.5 },
  { id: '6', title: 'Jujutsu Kaisen', description: 'La lutte contre les fléaux', coverImage: '', genre: ['Action', 'Surnaturel'], rating: 4.8 },
];

// ============================================
// SVG ICON
// ============================================
const IconAnime = () => (
  <svg className="w-8 h-8 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <polygon points="9 7 16 12 9 17 9 7" />
  </svg>
);

// ============================================
// PAGE
// ============================================
export default function InkStreamPage() {
  const [animes, setAnimes] = useState<Anime[]>(mockAnimes);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // ============================================
  // FETCH ANIMES (optionnel, avec fallback mock)
  // ============================================
  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) return;

        const params = new URLSearchParams();
        if (search) params.set("q", search);

        const res = await fetch(`${baseUrl}/inkstream/search?${params}`);
        const data = await res.json();
        
        if (data.data && data.data.length > 0) {
          setAnimes(data.data);
        }
      } catch (error) {
        console.error("Erreur API, utilisation des mock:", error);
        // On garde les mock
      }
    };

    if (search) {
      fetchAnimes();
    }
  }, [search]);

  // ============================================
  // HANDLE SEARCH
  // ============================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSearch(false);
    }
  };

  const filteredAnimes = animes.filter((anime) =>
    anime.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-ink-bg/80 backdrop-blur-sm border-b border-ink-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold text-white">InkStream</span>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-ink-muted hover:text-white transition-colors"
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
              className="flex-1 px-4 py-2 rounded-lg bg-ink-card border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none transition-colors"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark transition-colors"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearch("");
              }}
              className="text-ink-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        )}
      </header>

      {/* ===== RÉSULTATS ===== */}
      <main className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Animes</h1>
          <span className="text-ink-muted text-sm">{filteredAnimes.length} résultats</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-ink-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredAnimes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <IconAnime />
            <p className="text-ink-muted mt-4">Aucun anime trouvé</p>
            <p className="text-ink-muted text-sm mt-1">Essayez une autre recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAnimes.map((anime) => (
              <Link
                key={anime.id}
                href={`/inkstream/${anime.id}`}
                className="bg-ink-card border border-ink-border rounded-xl overflow-hidden hover:border-accent transition-all active:scale-[0.97]"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center relative">
                  <IconAnime />
                  {anime.rating && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 text-xs font-bold bg-black/50 text-yellow-500 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      {anime.rating.toFixed(1)}
                    </span>
                  )}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {anime.genre?.slice(0, 2).map((g: string) => (
                      <span key={g} className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-semibold truncate text-white">{anime.title}</h3>
                  <p className="text-ink-muted text-[10px] truncate">
                    {anime.uploader?.full_name || anime.uploader?.username || "Source inconnue"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <BottomNav />

    </div>
  );
}