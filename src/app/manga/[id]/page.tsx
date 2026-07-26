"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Eye, 
  Clock,
  Plus,
  FileText,
  Image as ImageIcon
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Chapter = {
  id: string;
  number: number;
  title: string | null;
  isFree: boolean;
  price: number | null;
  publishedAt: string | null;
  pageCount: number;
  contentType: string;
  pages?: any[];
  pdfUrl?: string;
};

type Manga = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  status: string;
  genre: string[];
  viewsCount: number;
  likesCount: number;
  subscribersCount: number;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  chapters: Chapter[];
};

export default function MangaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthor, setIsAuthor] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch(`${API_URL}/mangas/${params.id}`);
        if (!res.ok) throw new Error("Manga non trouvé");
        const data = await res.json();
        setManga(data);

        // Vérifier si l'utilisateur est l'auteur
        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            setIsAuthor(userData.id === data.author.id);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [params.id]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/social/like/${params.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setManga((prev) => prev ? {
          ...prev,
          likesCount: prev.likesCount + 1,
        } : null);
      }
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
        <p className="text-gray-500 text-center">{error || "Manga non trouvé"}</p>
        <Link href="/discover" className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold">
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/discover" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-sm font-medium text-black truncate max-w-[150px]">{manga.title}</span>
          <div className="w-16" />
        </div>
      </header>

      {/* ===== COUVERTURE ===== */}
      <div className="relative aspect-[2/3] bg-gray-100">
        {manga.coverUrl ? (
          <img
            src={manga.coverUrl}
            alt={manga.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white">{manga.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-white/80">par {manga.author.username}</p>
            {manga.status === "ONGOING" && (
              <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-medium">
                En cours
              </span>
            )}
            {manga.status === "COMPLETED" && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-medium">
                Terminé
              </span>
            )}
            {manga.status === "HIATUS" && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500 text-white text-[10px] font-medium">
                En pause
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== INFOS ===== */}
      <section className="px-4 py-4 border-b border-gray-200">
        <p className="text-gray-700 text-sm">{manga.description || "Aucune description"}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {manga.genre.map((g) => (
            <span key={g} className="px-3 py-1 rounded-full bg-gray-100 text-black text-xs font-medium">
              {g}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-black transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span>{manga.likesCount || 0}</span>
          </button>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{manga.viewsCount || 0}</span>
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{manga.chapters?.length || 0} chapitres</span>
          </span>
        </div>
      </section>

      {/* ===== CHAPITRES ===== */}
      <section className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-black">Chapitres</h2>
          <span className="text-xs text-gray-400">{manga.chapters?.length || 0} chapitres</span>
        </div>

        {!manga.chapters || manga.chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 mt-4 text-sm">Aucun chapitre publié</p>
            {isAuthor && (
              <Link
                href={`/manga/${manga.id}/chapter/new`}
                className="mt-4 px-6 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter le premier chapitre
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {manga.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/manga/${manga.id}/chapter/${chapter.number}`}
                  className="block py-3 px-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-black transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-black">
                        Chapitre {chapter.number} {chapter.title && `- ${chapter.title}`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {chapter.isFree ? (
                          <span className="text-xs text-green-600 font-medium">Gratuit</span>
                        ) : (
                          <span className="text-xs text-gray-500">{chapter.price || 0.50}$</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {chapter.contentType === "PDF" ? "PDF" : `${chapter.pageCount || 0} pages`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString() : "Brouillon"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* ===== AJOUTER UN CHAPITRE ===== */}
            {isAuthor && (
              <Link
                href={`/manga/${manga.id}/chapter/new`}
                className="mt-4 w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter un chapitre
              </Link>
            )}
          </>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
