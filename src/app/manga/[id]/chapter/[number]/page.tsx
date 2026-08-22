"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CommentSection } from "@/components/comments/CommentSection";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  Eye,
  Heart,
  Sparkles,
  Crown,
  Download,
  Share2,
  Bookmark,
  Check,
  UserPlus,
  AlertCircle,
  FileText,
  Image as ImageIcon
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
  contentType: "PDF" | "IMAGES";
  pages: Array<{ url: string; order: number; isFree: boolean }>;
  pdfKey: string | null;
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const mangaId = params.id as string;
  const chapterNumber = parseInt(params.number as string);

  // ============================================
  // RÉCUPÉRER LE CHAPITRE
  // ============================================
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        console.log("🔍 1. Début du chargement");
        console.log("📌 mangaId:", mangaId);
        console.log("📌 chapterNumber:", chapterNumber);

        const url = `${API_URL}/mangas/${mangaId}/chapters/number/${chapterNumber}`;
        console.log("📡 2. Appel API:", url);

        const res = await fetch(url);
        console.log("📡 3. Statut HTTP:", res.status);

        if (!res.ok) {
          throw new Error(`Chapitre non trouvé (${res.status})`);
        }

        const data = await res.json();
        console.log("📦 4. Données reçues:", data);

        setChapter(data);
        
        // ✅ Gestion du PDF
        if (data.contentType === "PDF" && data.pdfUrl) {
          setPdfUrl(data.pdfUrl);
          console.log("✅ PDF URL trouvé:", data.pdfUrl);
        } else if (data.contentType === "PDF") {
          console.warn("⚠️ Chapitre PDF mais pdfUrl est null");
        } else if (data.contentType === "IMAGES") {
          console.log("✅ Chapitre en images, pages:", data.pages?.length || 0);
        }

        const token = localStorage.getItem("token");
        console.log("🔑 Token présent:", !!token);

        if (token) {
          const userRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            console.log("👤 Utilisateur:", userData.username);
            if (data.isFree || userData.premiumActive) {
              setHasAccess(true);
              console.log("✅ Accès accordé (Premium ou gratuit)");
            } else {
              console.log("⛔ Accès refusé (pas premium et chapitre payant)");
            }
          }
        } else if (data.isFree) {
          setHasAccess(true);
          console.log("✅ Accès accordé (Chapitre gratuit)");
        }

        console.log("✅ 5. Fin du chargement");
      } catch (err: any) {
        console.error("❌ ERREUR:", err);
        console.error("📋 Message:", err.message);
        console.error("📋 Stack:", err.stack);
        setError(err.message);
        setDebugInfo(JSON.stringify({ mangaId, chapterNumber, error: err.message }, null, 2));
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
  // BOOKMARK
  // ============================================
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  // ============================================
  // LIKE
  // ============================================
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // ============================================
  // SHARE
  // ============================================
  const handleShare = () => {
    const shareUrl = `https://ink-drop-one.vercel.app/manga/${mangaId}/chapter/${chapterNumber}`;
    if (navigator.share) {
      navigator.share({ title: chapter?.title || `Chapitre ${chapterNumber}`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("🔗 Lien copié !");
    }
  };

  // ============================================
  // AFFICHAGE - CHARGEMENT
  // ============================================
  if (loading) {
    return <Loader message="Chargement du chapitre" />;
  }

  // ============================================
  // AFFICHAGE - ERREUR
  // ============================================
  if (error || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
        <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
        <p className="text-zinc-400 text-center max-w-md">{error || "Chapitre non trouvé"}</p>
        
        {debugInfo && (
          <div className="mt-4 p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-500 max-w-md overflow-auto">
            <p className="font-mono">{debugInfo}</p>
          </div>
        )}
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
          >
            Réessayer
          </button>
          <Link
            href={`/manga/${mangaId}`}
            className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all"
          >
            Retourner au manga
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // AFFICHAGE - PAS D'ACCÈS → ACHAT
  // ============================================
  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
        <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Link href={`/manga/${mangaId}`} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </Link>
            <span className="text-base font-bold tracking-tight text-white/90">
              Chap. {chapterNumber}
            </span>
            <div className="w-9" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Chapitre payant</h2>
          <p className="text-zinc-400 text-sm mb-1">
            Chapitre {chapterNumber} — <span className="text-amber-400 font-semibold">{chapter.price || 0.50}$</span>
          </p>
          <p className="text-zinc-500 text-xs mb-6">
            {chapter.pageCount || 0} pages
          </p>
          <button
            onClick={handleBuy}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold transition-all shadow-lg shadow-amber-500/20"
          >
            Acheter le chapitre
          </button>
          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Ou abonne-toi à INKDROP Premium pour un accès illimité</span>
          </div>
          <Link href="/premium" className="mt-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
            Voir les offres Premium →
          </Link>
        </main>

        <BottomNav />
      </div>
    );
  }

  // ============================================
  // AFFICHAGE - LECTURE DU CHAPITRE
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href={`/manga/${mangaId}`} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <span className="text-base font-bold tracking-tight text-white/90 truncate max-w-[150px]">
            Chap. {chapterNumber}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full hover:bg-zinc-900 transition-colors ${isBookmarked ? "text-blue-400" : "text-zinc-400 hover:text-white"}`}
            >
              {isBookmarked ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLike}
              className={`p-2 rounded-full hover:bg-zinc-900 transition-colors ${isLiked ? "text-rose-500" : "text-zinc-400 hover:text-white"}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        
        {/* TITRE */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            {chapter.title || `Chapitre ${chapterNumber}`}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">{chapter.manga.title}</p>
          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {chapter.pageCount || 0} pages
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-1">
              {chapter.contentType === "PDF" ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
              {chapter.contentType === "PDF" ? "PDF" : "Images"}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className={chapter.isFree ? "text-emerald-400" : "text-amber-400"}>
              {chapter.isFree ? "Gratuit" : `${chapter.price || 0.50}$`}
            </span>
          </div>
        </div>

        {/* RÉSUMÉ */}
        {chapter.summary && (
          <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-blue-400">Résumé du chapitre</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{chapter.summary}</p>
          </div>
        )}

        {/* ========================================== */}
        {/* ✅ LECTEUR - GESTION DES DEUX MODES */}
        {/* ========================================== */}

        {/* ✅ MODE PDF */}
        {chapter.contentType === "PDF" && (
          pdfUrl ? (
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xl">
              <iframe
                src={pdfUrl}
                className="w-full h-[70vh] border-0"
                title={`Chapitre ${chapterNumber}`}
                sandbox="allow-scripts allow-same-origin"
                onError={() => setError("Erreur de chargement du PDF")}
              />
            </div>
          ) : (
            <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 p-12 text-center">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">PDF non disponible</p>
              <p className="text-zinc-500 text-xs mt-1">Le fichier PDF n'a pas pu être chargé</p>
              <p className="text-zinc-600 text-[10px] mt-2 font-mono">
                pdfKey: {chapter.pdfKey || "null"}
              </p>
            </div>
          )
        )}

        {/* ✅ MODE IMAGES */}
        {chapter.contentType === "IMAGES" && chapter.pages && chapter.pages.length > 0 && (
          <div className="space-y-4">
            {chapter.pages.map((page: any, index: number) => (
              <div key={index} className="bg-zinc-900/40 rounded-xl border border-zinc-800/60 overflow-hidden">
                <img
                  src={page.url}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-page.png";
                  }}
                />
                <div className="text-center text-xs text-zinc-500 py-2">
                  Page {index + 1} / {chapter.pages.length}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ AUCUN CONTENU */}
        {!chapter.contentType && (
          <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">Aucun contenu disponible</p>
            <p className="text-zinc-500 text-xs mt-1">Ce chapitre n'a pas de contenu associé</p>
          </div>
        )}

        {/* COMMENTAIRES */}
        <div className="mt-8">
          <CommentSection mangaId={mangaId} chapterId={chapter.id} />
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-between gap-2 mt-6">
          <Link
            href={`/manga/${mangaId}/chapter/${chapterNumber - 1}`}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              chapterNumber > 1
                ? "bg-zinc-800/60 hover:bg-zinc-800 text-white border border-zinc-700/50"
                : "bg-zinc-900/40 text-zinc-600 cursor-not-allowed pointer-events-none border border-zinc-800/30"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Link>
          <Link
            href={`/manga/${mangaId}`}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-800/60 hover:bg-zinc-800 text-white border border-zinc-700/50 transition-all"
          >
            Tous les chapitres
          </Link>
          <Link
            href={`/manga/${mangaId}/chapter/${chapterNumber + 1}`}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
