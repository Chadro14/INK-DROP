"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CommentSection } from "@/components/comments/CommentSection";
import { Loader } from "@/components/ui/loader";
import { ChapterPurchaseModal } from "@/components/chapter/ChapterPurchaseModal";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lock,
  Eye,
  Heart,
  Sparkles,
  Crown,
  Share2,
  Bookmark,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Clock,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// ============================================
// TYPES
// ============================================

type Chapter = {
  id: string;
  number: number;
  title: string | null;
  isFree: boolean;
  price: number | null;
  pageCount: number;
  summary: string | null;
  contentType: "PDF" | "IMAGES";
  pages: Array<{ url: string; order: number; isFree: boolean }> | null;
  pdfKey: string | null;
  publishedAt: string | null;
  manga: {
    id: string;
    title: string;
    author: {
      username: string;
    };
  };
};

type AccessMethod = "free" | "premium" | "manas" | "ticket" | "author" | null;

type AccessInfo = {
  hasAccess: boolean;
  method: AccessMethod;
  expiresAt?: string | null;
  userBalance: {
    manas: number;
    tickets: number;
  };
};

// ============================================
// HELPERS
// ============================================

function formatRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "expiré";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  return `${mins}min`;
}

// ============================================
// COMPOSANT
// ============================================

export default function ChapterReader() {
  const params = useParams();
  const mangaId = params?.id as string;
  const chapterNumber = parseInt(params?.number as string, 10);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [access, setAccess] = useState<AccessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // ============================================
  // CHARGEMENT
  // ============================================

  const loadChapterAndAccess = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      // 1) Chapitre par numéro
      const chapterRes = await fetch(
        `${API_URL}/mangas/${mangaId}/chapters/number/${chapterNumber}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!chapterRes.ok) {
        throw new Error(`Chapitre non trouvé (${chapterRes.status})`);
      }

      const chapterJson = await chapterRes.json();
      const chapterData: Chapter = chapterJson.data ?? chapterJson;
      setChapter(chapterData);

      // 2) Accès (si on a l'id du chapitre)
      if (chapterData.id) {
        try {
          const accessRes = await fetch(
            `${API_URL}/mangas/${mangaId}/chapters/${chapterData.id}/access`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
          );

          if (accessRes.ok) {
            const accessJson = await accessRes.json();
            const accessData: AccessInfo = accessJson.data ?? accessJson;
            setAccess(accessData);
          } else {
            setAccess({
              hasAccess: false,
              method: null,
              userBalance: { manas: 0, tickets: 0 },
            });
          }
        } catch {
          setAccess({
            hasAccess: false,
            method: null,
            userBalance: { manas: 0, tickets: 0 },
          });
        }
      }

      // 3) PDF : le backend ne renvoie que pdfKey, pas d'URL signée.
      // On garde le comportement actuel (pas d'iframe tant qu'on n'a pas d'URL).
      setPdfUrl(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur de chargement";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [mangaId, chapterNumber]);

  useEffect(() => {
    if (mangaId && !Number.isNaN(chapterNumber)) {
      loadChapterAndAccess();
    }
  }, [mangaId, chapterNumber, loadChapterAndAccess]);

  // ============================================
  // ACTIONS
  // ============================================

  const handleBookmark = () => setIsBookmarked((v) => !v);
  const handleLike = () => setIsLiked((v) => !v);

  const handleShare = async () => {
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/manga/${mangaId}/chapter/${chapterNumber}`;
    const title = chapter?.title || `Chapitre ${chapterNumber}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Lien copié !");
    } catch {
      /* ignore */
    }
  };

  // ============================================
  // ÉTATS DE RENDU
  // ============================================

  if (loading) {
    return <Loader message="Chargement du chapitre" />;
  }

  if (error || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Erreur de chargement
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          {error || "Chapitre non trouvé"}
        </p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => loadChapterAndAccess()}
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            Réessayer
          </button>
          <Link
            href={`/manga/${mangaId}`}
            className="px-6 py-2.5 rounded-full bg-card hover:bg-muted text-foreground font-semibold transition-all border border-border/60"
          >
            Retourner au manga
          </Link>
        </div>
      </div>
    );
  }

  const hasAccess = access?.hasAccess === true;
  const method = access?.method ?? null;
  const expiresAt = access?.expiresAt ?? null;
  const userBalance = access?.userBalance ?? { manas: 0, tickets: 0 };

  // ============================================
  // PAS D'ACCÈS → MODALE
  // ============================================

  if (!hasAccess) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Link
              href={`/manga/${mangaId}`}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </Link>
            <span className="text-base font-bold tracking-tight text-foreground/90">
              Chap. {chapterNumber}
            </span>
            <div className="w-9" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-amber-500 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">
            Chapitre payant
          </h2>
          <p className="text-muted-foreground text-sm mb-1">
            Chapitre {chapterNumber} —{" "}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {chapter.price || 50} MANAS
            </span>
          </p>
          <p className="text-muted-foreground/70 text-xs mb-6">
            {chapter.pageCount || 0} pages
          </p>

          {token ? (
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold transition-all shadow-lg shadow-amber-500/20"
            >
              Débloquer le chapitre
            </button>
          ) : (
            <Link
              href={`/login?redirect=/manga/${mangaId}/chapter/${chapterNumber}`}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold transition-all shadow-lg shadow-amber-500/20"
            >
              Se connecter pour débloquer
            </Link>
          )}

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>
              Ou abonne-toi à INKDROP Premium pour un accès illimité
            </span>
          </div>
          <Link
            href="/premium"
            className="mt-2 text-amber-600 dark:text-amber-400 hover:text-amber-500 text-sm font-medium transition-colors"
          >
            Voir les offres Premium →
          </Link>
        </main>

        {showPurchaseModal && (
          <ChapterPurchaseModal
            chapter={{
              id: chapter.id,
              number: chapter.number,
              title: chapter.title,
              price: chapter.price || 50,
            }}
            manga={{
              id: mangaId,
              title: chapter.manga?.title ?? "",
            }}
            userBalance={userBalance}
            onClose={() => setShowPurchaseModal(false)}
            onSuccess={() => {
              setShowPurchaseModal(false);
              loadChapterAndAccess();
            }}
          />
        )}

        <BottomNav />
      </div>
    );
  }

  // ============================================
  // ACCÈS ACCORDÉ → LECTURE
  // ============================================

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href={`/manga/${mangaId}`}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <span className="text-base font-bold tracking-tight text-foreground/90 truncate max-w-[150px]">
            Chap. {chapterNumber}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full hover:bg-card transition-colors ${
                isBookmarked
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Enregistrer"
            >
              {isBookmarked ? (
                <Check className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleLike}
              className={`p-2 rounded-full hover:bg-card transition-colors ${
                isLiked
                  ? "text-rose-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="J'aime"
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
              title="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* BANDEAU TICKET */}
      {method === "ticket" && expiresAt && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Accès temporaire — expire dans{" "}
              <strong>{formatRemaining(expiresAt)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {/* TITRE */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            {chapter.title || `Chapitre ${chapterNumber}`}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {chapter.manga.title}
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {chapter.pageCount || 0} pages
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1">
              {chapter.contentType === "PDF" ? (
                <FileText className="w-3.5 h-3.5" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              {chapter.contentType === "PDF" ? "PDF" : "Images"}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span
              className={
                chapter.isFree
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }
            >
              {chapter.isFree ? "Gratuit" : `${chapter.price || 50} MANAS`}
            </span>
          </div>
        </div>

        {/* RÉSUMÉ */}
        {chapter.summary && (
          <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
                Résumé du chapitre
              </h3>
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed">
              {chapter.summary}
            </p>
          </div>
        )}

        {/* MODE PDF */}
        {chapter.contentType === "PDF" &&
          (pdfUrl ? (
            <div className="bg-card rounded-xl border border-border/80 overflow-hidden shadow-xl">
              <iframe
                src={pdfUrl}
                className="w-full h-[70vh] border-0"
                title={`Chapitre ${chapterNumber}`}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="bg-card/40 rounded-xl border border-border/80 p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">PDF non disponible</p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                Le fichier PDF n'a pas pu être chargé
              </p>
            </div>
          ))}

        {/* MODE IMAGES */}
        {chapter.contentType === "IMAGES" &&
          chapter.pages &&
          chapter.pages.length > 0 && (
            <div className="space-y-4">
              {chapter.pages.map((page, index) => (
                <div
                  key={`${page.order}-${index}`}
                  className="bg-card/40 rounded-xl border border-border/60 overflow-hidden"
                >
                  <img
                    src={page.url}
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="text-center text-xs text-muted-foreground py-2">
                    Page {index + 1} / {chapter.pages?.length ?? 0}
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* AUCUN CONTENU */}
        {!chapter.contentType && (
          <div className="bg-card/40 rounded-xl border border-border/80 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun contenu disponible</p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Ce chapitre n'a pas de contenu associé
            </p>
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
                ? "bg-card hover:bg-muted text-foreground border border-border/60"
                : "bg-card/40 text-muted-foreground/50 cursor-not-allowed pointer-events-none border border-border/30"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Link>
          <Link
            href={`/manga/${mangaId}`}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-card hover:bg-muted text-foreground border border-border/60 transition-all"
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
