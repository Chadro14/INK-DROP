"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar, 
  User, 
  ChevronRight, 
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  FileText
} from "lucide-react";

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

  const getAuthorName = (author: any): string => {
    if (!author) return "Inconnu";
    if (typeof author === "string") return author;
    if (author.name) return author.name;
    return "Inconnu";
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      ongoing: "En cours",
      completed: "Terminé",
      hiatus: "En pause",
      cancelled: "Annulé",
    };
    return statusMap[status] || status || "Inconnu";
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      ongoing: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      hiatus: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      cancelled: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    };
    return colorMap[status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  };

  const getGenres = (genres: any): string[] => {
    if (!genres) return [];
    if (Array.isArray(genres)) return genres;
    return [];
  };

  const getDescription = (desc: any): string => {
    if (!desc) return "Aucune description disponible.";
    if (typeof desc === "string") return desc;
    return "Aucune description disponible.";
  };

  // ============================================
  // RÉCUPÉRER LE MANGA
  // ============================================
  useEffect(() => {
    if (!mangaId) {
      setError("ID du manga manquant");
      setLoading(false);
      return;
    }

    const fetchManga = async () => {
      try {
        const res = await fetch(`${API_URL}/manga-api/${mangaId}`);
        if (!res.ok) throw new Error("Manga non trouvé");
        const data = await res.json();

        if (data && data.data) {
          setManga(data.data);
          setMangaTitle(data.data.title || "");
        } else {
          throw new Error("Données du manga invalides");
        }
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [mangaId]);

  // ============================================
  // RÉCUPÉRER LES CHAPITRES
  // ============================================
  useEffect(() => {
    if (!mangaTitle || mangaTitle === "Titre inconnu") return;

    const fetchChaptersByTitle = async () => {
      setLoadingChapters(true);
      try {
        const searchRes = await fetch(
          `${API_URL}/manga-api/search?q=${encodeURIComponent(mangaTitle)}&limit=1`
        );
        if (!searchRes.ok) throw new Error("Recherche impossible");

        const searchData = await searchRes.json();

        if (!searchData.data || searchData.data.length === 0) {
          setChapters([]);
          return;
        }

        const realMangaId = searchData.data[0].id;
        if (!realMangaId) {
          setChapters([]);
          return;
        }

        const chaptersRes = await fetch(
          `${API_URL}/manga-api/${realMangaId}/chapters?limit=100`
        );
        if (!chaptersRes.ok) throw new Error("Impossible de charger les chapitres");

        const chaptersData = await chaptersRes.json();
        setChapters(chaptersData.data || []);
      } catch (err: any) {
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
    return <Loader message="Chargement du manga" />;
  }

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
        <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-zinc-400 text-center">{error || "Manga non trouvé"}</p>
        <Link
          href="/discover"
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  const safeTitle = manga.title || "Titre inconnu";
  const safeAuthor = getAuthorName(manga.author);
  const safeStatus = getStatusLabel(manga.status);
  const statusColor = getStatusColor(manga.status);
  const safeGenres = getGenres(manga.genres);
  const safeDescription = getDescription(manga.description);
  const safeYear = manga.year || "N/A";
  const safeCover = manga.coverImage || null;

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-white truncate flex-1">{safeTitle}</span>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">

        {/* COUVERTURE */}
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-zinc-800 mb-6 bg-zinc-900">
          {safeCover ? (
            <img
              src={safeCover}
              alt={safeTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{safeTitle}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 mt-1">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" />
                {safeAuthor}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                {safeYear}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                {safeStatus}
              </span>
            </div>
          </div>
        </div>

        {/* STATS RAPIDES - SVG PURES */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
            <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">12.4k</p>
            <p className="text-[10px] text-zinc-500">Vues</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
            <Heart className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">2.1k</p>
            <p className="text-[10px] text-zinc-500">Likes</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
            <MessageCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">348</p>
            <p className="text-[10px] text-zinc-500">Commentaires</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
            <BookOpen className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{chapters.length}</p>
            <p className="text-[10px] text-zinc-500">Chapitres</p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 mb-6">
          <p className="text-zinc-300 text-sm leading-relaxed">{safeDescription}</p>
          {safeGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {safeGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CHAPITRES */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Chapitres ({chapters.length})
          </h2>

          {loadingChapters ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-zinc-700 mx-auto" />
              <p className="mt-2 text-zinc-500 text-sm">Aucun chapitre disponible</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  href={`/read/${mangaId}/chapter/${chapter.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                      {chapter.chapter || index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {chapter.title || `Chapitre ${chapter.chapter || index + 1}`}
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(chapter.publishedAt)}
                        {chapter.pages && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-zinc-600" />
                            <span>{chapter.pages} pages</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
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
