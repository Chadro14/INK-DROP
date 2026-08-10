"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, BookOpen, Clock, Calendar, User, Tag, ChevronRight } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type MangaDetails = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  author: { id: string; name: string };
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
  const [manga, setManga] = useState<MangaDetails | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(true);

  const mangaId = params.id as string;

  // Récupérer les détails du manga
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch(`${API_URL}/manga-api/${mangaId}`);
        if (res.ok) {
          const data = await res.json();
          setManga(data.data);
        }
      } catch (error) {
        console.error("Erreur chargement manga:", error);
      } finally {
        setLoading(false);
      }
    };

    if (mangaId) {
      fetchManga();
    }
  }, [mangaId]);

  // Récupérer les chapitres
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch(`${API_URL}/manga-api/${mangaId}/chapters?limit=100`);
        if (res.ok) {
          const data = await res.json();
          setChapters(data.data || []);
        }
      } catch (error) {
        console.error("Erreur chargement chapitres:", error);
      } finally {
        setLoadingChapters(false);
      }
    };

    if (mangaId) {
      fetchChapters();
    }
  }, [mangaId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 px-4">
        <p className="text-zinc-400 text-center">Manga non trouvé</p>
        <Link href="/discover" className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 text-white font-semibold">
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-white truncate">{manga.title}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">

        {/* BANNIÈRE */}
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-zinc-800 mb-6">
          {manga.coverImage ? (
            <img
              src={manga.coverImage}
              alt={manga.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{manga.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 mt-1">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {manga.author?.name || "Inconnu"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {manga.year || "N/A"}
              </span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                manga.status === "ongoing"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : manga.status === "completed"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}>
                {manga.status === "ongoing" ? "En cours" : manga.status === "completed" ? "Terminé" : "En pause"}
              </span>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 mb-6">
          <p className="text-zinc-300 text-sm leading-relaxed">
            {manga.description || "Aucune description disponible."}
          </p>
          {manga.genres && manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {manga.genres.map((genre) => (
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
                        {chapter.publishedAt ? formatDate(chapter.publishedAt) : "Date inconnue"}
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