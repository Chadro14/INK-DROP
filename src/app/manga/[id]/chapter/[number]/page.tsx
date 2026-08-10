"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CommentSection } from "@/components/comments/CommentSection";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  Eye,
  Heart,
  Sparkles
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Chapter = {
  id: string;
  number: number;
  title: string;
  isFree: boolean;
  price: number;
  pageCount: number;
  pdfUrl: string;
  summary: string | null;
  publishedAt: string;
  manga: {
    id: string;
    title: string;
    author: {
      username: string;
    };
  };
};

type User = {
  id: string;
  premiumActive: boolean;
};

export default function ChapterReader() {
  const params = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const mangaId = params.id as string;
  const chapterNumber = parseInt(params.number as string);

  // ============================================
  // RÉCUPÉRER LE CHAPITRE
  // ============================================
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`${API_URL}/mangas/${mangaId}/chapters/${chapterNumber}`);
        if (!res.ok) {
          throw new Error("Chapitre non trouvé");
        }
        const data = await res.json();
        setChapter(data);
        setPdfUrl(data.pdfUrl);

        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            if (data.isFree || userData.premiumActive) {
              setHasAccess(true);
            }
          }
        } else if (data.isFree) {
          setHasAccess(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [mangaId, chapterNumber]);

  // ============================================
  // ACHETER LE CHAPITRE
  // ============================================
  const handleBuy = () => {
    alert(`🔒 Paiement de ${chapter?.price || 0.50}$ pour le chapitre ${chapterNumber}`);
  };

  // ============================================
  // AFFICHAGE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
        <p className="text-gray-500 text-center">{error || "Chapitre non trouvé"}</p>
        <Link href={`/manga/${mangaId}`} className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold">
          Retourner au manga
        </Link>
      </div>
    );
  }

  // ============================================
  // PAS D'ACCÈS → ACHAT
  // ============================================
  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <Link href={`/manga/${mangaId}`} className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Retour</span>
            </Link>
            <span className="text-lg font-bold text-black truncate max-w-[150px]">
              Chap. {chapterNumber}
            </span>
            <div className="w-16" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Chapitre payant</h2>
          <p className="text-gray-500 text-sm mb-1">
            Chapitre {chapterNumber} — {chapter.price || 0.50}$
          </p>
          <p className="text-gray-400 text-xs mb-6">
            {chapter.pageCount || 0} pages
          </p>
          <button
            onClick={handleBuy}
            className="px-8 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Acheter le chapitre
          </button>
          <p className="text-gray-400 text-xs mt-4">
            💡 Ou abonne-toi à INKDROP Premium pour accès illimité
          </p>
          <Link href="/premium" className="text-black text-sm font-medium mt-2 hover:underline">
            Voir les offres Premium →
          </Link>
        </main>

        <BottomNav />
      </div>
    );
  }

  // ============================================
  // LECTURE DU CHAPITRE + COMMENTAIRES
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href={`/manga/${mangaId}`} className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black truncate max-w-[150px]">
            Chap. {chapterNumber}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{chapter.pageCount || 0}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-black">{chapter.title || `Chapitre ${chapterNumber}`}</h1>
          <p className="text-gray-400 text-sm">{chapter.manga.title}</p>
        </div>

        {/* ✅ RÉSUMÉ */}
        {chapter.summary && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-blue-700">📖 Résumé du chapitre</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{chapter.summary}</p>
          </div>
        )}

        {/* LECTEUR PDF */}
        {pdfUrl ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <iframe
              src={pdfUrl}
              className="w-full h-[70vh] border-0"
              title={`Chapitre ${chapterNumber}`}
            />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Contenu non disponible</p>
          </div>
        )}

        {/* ✅ SECTION COMMENTAIRES */}
        <CommentSection mangaId={mangaId} chapterId={chapter.id} />

        {/* NAVIGATION */}
        <div className="flex items-center justify-between mt-6">
          <Link
            href={`/manga/${mangaId}/chapter/${chapterNumber - 1}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              chapterNumber > 1
                ? "bg-gray-100 text-black hover:bg-gray-200"
                : "bg-gray-50 text-gray-300 cursor-not-allowed pointer-events-none"
            }`}
          >
            <ChevronLeft className="w-4 h-4 inline" /> Précédent
          </Link>
          <Link
            href={`/manga/${mangaId}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-black hover:bg-gray-200 transition-all"
          >
            Tous les chapitres
          </Link>
          <Link
            href={`/manga/${mangaId}/chapter/${chapterNumber + 1}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all"
          >
            Suivant <ChevronRight className="w-4 h-4 inline" />
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
