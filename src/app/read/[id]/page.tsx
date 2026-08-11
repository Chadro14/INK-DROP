"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, BookOpen, Clock, Calendar, User, ChevronRight } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Manga = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  author: string | { name: string; id?: string };
  status: string;
  year: number;
  genres: string[];
  chapters: number;
  rating: number;
};

type Chapter = {
  id: string;
  chapter: string;
  title: string;
  pages: number;
  publishedAt: string;
};

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [error, setError] = useState("");
  const [mangaTitle, setMangaTitle] = useState("");

  const mangaId = params?.id as string;

  // ✅ Fonction sécurisée pour récupérer le nom de l'auteur
  const getAuthorName = (author: any): string => {
    if (!author) return "Inconnu";
    if (typeof author === "string") return author;
    if (author.name) return author.name;
    return "Inconnu";
  };

  // ✅ Fonction sécurisée pour récupérer le statut
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'ongoing': 'En cours',
      'completed': 'Terminé',
      'hiatus': 'En pause',
      'cancelled': 'Annulé',
    };
    return statusMap[status] || status || 'Inconnu';
  };

  // ✅ Fonction sécurisée pour récupérer les genres
  const getGenres = (genres: any): string[] => {
    if (!genres) return [];
    if (Array.isArray(genres)) return genres;
    return [];
  };

  // ✅ Fonction sécurisée pour récupérer la description
  const getDescription = (desc: any): string => {
    if (!desc) return "Aucune description disponible.";
    if (typeof desc === "string") return desc;
    return "Aucune description disponible.";
  };

  // ============================================
  // 1. RÉCUPÉRER LE MANGA PAR ID
  // ============================================
  useEffect(() => {
    if (!mangaId) {
      setError("ID du manga manquant");
      setLoading(false);
      return;
    }

    const fetchManga = async () => {
      try {
        console.log("🔍 Fetch manga:", mangaId);
        const res = await fetch(`${API_URL}/manga-api/${mangaId}`);
        if (!res.ok) throw new Error("Manga non trouvé");
        const data = await res.json();
        console.log("📦 Données manga:", data);
        
        if (data && data.data) {
          setManga(data.data);
          setMangaTitle(data.data.title || "");
        } else {
          throw new Error("Données du manga invalides");
        }
      } catch (err: any) {
        console.error("❌ Erreur fetch manga:", err);
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [mangaId]);

  // ============================================
  // 2. RÉCUPÉRER LES CHAPITRES PAR TITRE
  // ============================================
  useEffect(() => {
    if (!mangaTitle || mangaTitle === "Titre inconnu") return;

    const fetchChaptersByTitle = async () => {
      setLoadingChapters(true);
      try {
        console.log("🔍 Recherche chapitres pour:", mangaTitle);
        const searchRes = await fetch(`${API_URL}/manga-api/search?q=${encodeURIComponent(mangaTitle)}&limit=1`);
        if (!searchRes.ok) throw new Error("Recherche impossible");

        const searchData = await searchRes.json();
        console.log("📦 Résultat recherche:", searchData);
        
        if (!searchData.data || searchData.data.length === 0) {
          setChapters([]);
          return;
        }

        const realMangaId = searchData.data[0].id;
        if (!realMangaId) {
          setChapters([]);
          return;
        }

        const chaptersRes = await fetch(`${API_URL}/manga-api/${realMangaId}/chapters?limit=100`);
        if (!chaptersRes.ok) throw new Error("Impossible de charger les chapitres");

        const chaptersData = await chaptersRes.json();
        console.log("📦 Chapitres:", chaptersData);
        setChapters(chaptersData.data || []);
      } catch (err: any) {
        console.error("❌ Erreur chapitres:", err);
        setChapters([]);
      } finally {
        setLoadingChapters(false);
      }
    };

    fetchChaptersByTitle();
  }, [mangaTitle]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Date inconnue";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 px-4">
        <p className="text-zinc-400 text-center">{error || "Manga non trouvé"}</p>
        <Link href="/discover" className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 text-white font-semibold">
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  // ✅ Sécurisation des données avant affichage
  const safeTitle = manga.title || "Titre inconnu";
  const safeAuthor = getAuthorName(manga.author);
  const safeStatus = getStatusLabel(manga.status);
  const safeGenres = getGenres(manga.genres);
  const safeDescription = getDescription(manga.description);
  const safeYear = manga.year || "N/A";
  const safeCover = manga.coverImage || null;

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-white truncate">{safeTitle}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">

        {/* Couverture */}
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-zinc-800 mb-6">
          {safeCover ? (
            <img
              src={safeCover}
              alt={safeTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{safeTitle}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 mt-1">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {safeAuthor}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {safeYear}
              </span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                safeStatus === "En cours"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : safeStatus === "Terminé"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}>
                {safeStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 mb-6">
          <p className="text-zinc-300 text-sm leading-relaxed">{safeDescription}</p>
          {safeGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {safeGenres.map((genre) => (
                <span key={genre} className="px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chapitres */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Chapitres ({chapters.length})
          </h2>

          {loadingChapters ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">
              <p>Aucun chapitre disponible</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/read/${mangaId}/chapter/${chapter.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                      {chapter.chapter || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                        {chapter.title || `Chapitre ${chapter.chapter || "?"}`}
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(chapter.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
