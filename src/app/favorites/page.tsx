"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Bookmark, 
  AlertCircle,
  BookOpen,
  Crown,
  Clock,
  User,
  Verified
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Favorite = {
  id: string;
  manga: {
    id: string;
    title: string;
    coverUrl: string | null;
    viewsCount: number;
    likesCount: number;
    isPremium: boolean;
    status: "ONGOING" | "COMPLETED" | "HIATUS";
    author: {
      id: string;
      username: string;
      avatarUrl: string | null;
      isCertified: boolean;
      badgeColor?: string | null;
    };
    _count: {
      chapters: number;
    };
  };
  createdAt: string;
};

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // RÉCUPÉRER LES FAVORIS
  // ============================================
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Erreur lors du chargement des favoris");
        }

        const data = await res.json();
        setFavorites(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [router]);

  // ============================================
  // AFFICHAGE
  // ============================================
  if (loading) {
    return <Loader message="Chargement de vos favoris" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight text-white/90">
              Favoris
            </span>
            <span className="text-sm text-zinc-500 bg-zinc-900 px-2.5 py-0.5 rounded-full">
              {favorites.length}
            </span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-24 w-full bg-gradient-to-r from-zinc-950 via-blue-950/30 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">

        {/* ERREUR */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
            <p className="text-zinc-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* LISTE DES FAVORIS */}
        {!error && (
          <>
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                  <Bookmark className="w-10 h-10 text-zinc-600" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Aucun favori</h2>
                <p className="text-zinc-400 text-sm max-w-sm">
                  Vous n'avez encore enregistré aucun manga. Commencez à explorer et ajoutez vos lectures préférées !
                </p>
                <Link
                  href="/discover"
                  className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
                >
                  Découvrir des mangas
                </Link>
              </div>
            ) : (
              <>
                {/* COMPTEUR DE FAVORIS */}
                <div className="flex items-center gap-2 mb-4 text-sm text-zinc-500">
                  <Bookmark className="w-4 h-4" />
                  <span>{favorites.length} manga{favorites.length > 1 ? 's' : ''} enregistré{favorites.length > 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-4">
                  {favorites.map((fav) => {
                    const badgeColor = fav.manga.author.badgeColor || "#3B82F6";
                    
                    return (
                      <div
                        key={fav.id}
                        className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group"
                      >
                        <div className="flex gap-4 p-4">
                          {/* COUVERTURE */}
                          <Link
                            href={`/manga/${fav.manga.id}`}
                            className="flex-shrink-0 w-20 h-28 md:w-24 md:h-32 bg-zinc-800 rounded-lg overflow-hidden"
                          >
                            {fav.manga.coverUrl ? (
                              <img
                                src={fav.manga.coverUrl}
                                alt={fav.manga.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-zinc-600" />
                              </div>
                            )}
                          </Link>

                          {/* INFOS */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/manga/${fav.manga.id}`}>
                              <h3 className="text-base md:text-lg font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">
                                {fav.manga.title}
                              </h3>
                            </Link>

                            {/* AUTEUR AVEC BADGE CERTIFIÉ */}
                            <Link
                              href={`/creator/${fav.manga.author.username}`}
                              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-blue-400 transition-colors mt-0.5"
                            >
                              <User className="w-3.5 h-3.5" />
                              <span>{fav.manga.author.username}</span>
                              {fav.manga.author.isCertified && (
                                <Verified
                                  className="w-3.5 h-3.5"
                                  fill={badgeColor}
                                  color="black"
                                  strokeWidth={1.5}
                                />
                              )}
                            </Link>

                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(fav.createdAt).toLocaleDateString("fr-FR")}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-zinc-700" />
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-sky-400" />
                                {fav.manga.viewsCount || 0}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-zinc-700" />
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-rose-400" />
                                {fav.manga.likesCount || 0}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-zinc-700" />
                              <span className="text-zinc-500">
                                {fav.manga._count.chapters || 0} chapitres
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                fav.manga.status === "ONGOING" 
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : fav.manga.status === "COMPLETED"
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}>
                                {fav.manga.status === "ONGOING" ? "En cours" : fav.manga.status === "COMPLETED" ? "Terminé" : "En pause"}
                              </span>
                              {fav.manga.isPremium && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  <Crown className="w-3 h-3 inline mr-0.5" />
                                  Premium
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
