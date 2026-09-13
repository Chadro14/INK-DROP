"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { CommentSection } from "@/components/comments/CommentSection";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  BookOpen,
  Eye,
  Heart,
  Users,
  Calendar,
  Plus,
  Edit,
  Crown,
  BadgeCheck,
  AlertCircle,
  Lock,
  Check,
  Clock,
  User as UserIcon,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// ============================================
// TYPES
// ============================================

type Chapter = {
  id: string;
  number: number;
  title: string | null;
  contentType: string;
  isFree: boolean;
  price: number | null;
  viewsCount: number;
  pageCount: number;
  coverUrl: string | null;
  publishedAt: string | null;
  createdAt: string;

  // ✅ Statut d'accès
  hasAccess?: boolean;
  accessMethod?: "free" | "premium" | "manas" | "ticket" | "author" | null;
  expiresAt?: string | null;
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
  isPremium: boolean;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    avatarColor: string | null;
    isCertified: boolean;
    badgeColor: string | null;
    role: string;
  };
  chapters: Chapter[];
  _count: {
    chapters: number;
    comments: number;
    likes: number;
    subscriptions: number;
  };
};

// ============================================
// HELPERS
// ============================================

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function getAccessBadge(ch: Chapter): {
  label: string;
  icon: any;
  className: string;
} {
  // Gratuit
  if (ch.isFree) {
    return {
      label: "Gratuit",
      icon: BookOpen,
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    };
  }

  // Auteur
  if (ch.hasAccess && ch.accessMethod === "author") {
    return {
      label: "Auteur",
      icon: Edit,
      className:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    };
  }

  // Premium
  if (ch.hasAccess && ch.accessMethod === "premium") {
    return {
      label: "Premium",
      icon: Crown,
      className:
        "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
    };
  }

  // Acheté en MANAS (permanent)
  if (ch.hasAccess && ch.accessMethod === "manas") {
    return {
      label: "Débloqué",
      icon: Check,
      className:
        "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    };
  }

  // Ticket (temporaire)
  if (ch.hasAccess && ch.accessMethod === "ticket") {
    if (ch.expiresAt) {
      const diff = new Date(ch.expiresAt).getTime() - Date.now();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return {
          label: `${hours}h${mins > 0 ? ` ${mins}min` : ""}`,
          icon: Clock,
          className:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        };
      }
    }
    return {
      label: "Ticket",
      icon: Clock,
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    };
  }

  // Payant, pas d'accès
  return {
    label: `${ch.price || 50} MANAS`,
    icon: Lock,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  };
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function MangaPage() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params?.id as string;

  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [subCount, setSubCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Récupérer le manga (infos générales)
        const res = await fetch(`${API_URL}/mangas/${mangaId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Manga non trouvé");

        const data = await res.json();
        const d = data.data || data;
        setManga(d);
        setLikeCount(d.likesCount || 0);
        setViewCount(d.viewsCount || 0);
        setSubCount(d.subscribersCount || 0);

        // 2. Récupérer les chapitres avec statut d'accès
        try {
          const chaptersRes = await fetch(
            `${API_URL}/mangas/${mangaId}/chapters-with-access`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
          );

          if (chaptersRes.ok) {
            const chaptersData = await chaptersRes.json();
            const chaptersList = chaptersData.data || [];
            // Mettre à jour le manga avec les chapitres enrichis
            setManga((prev) =>
              prev ? { ...prev, chapters: chaptersList } : prev,
            );
          }
        } catch (err) {
          console.error("Erreur chargement chapitres avec accès:", err);
        }

        // 3. Vérifier auteur
        if (token) {
          try {
            const me = await fetch(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (me.ok) {
              const meData = await me.json();
              setIsAuthor(d.author?.id === meData.id);
            } else {
              setIsAuthor(false);
            }
          } catch (err) {
            console.error("Erreur vérification auteur:", err);
            setIsAuthor(false);
          }

          await Promise.all([
            checkLike(token),
            checkSub(token),
            checkSave(token),
          ]);
        }

        await incrementView();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (mangaId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mangaId]);

  // ============================================
  // API HELPERS
  // ============================================
  const checkLike = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/social/has-liked-manga/${mangaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
      }
    } catch (e) {
      /* ignore */
    }
  };

  const checkSub = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/social/is-subscribed/${mangaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsSubscribed(data.subscribed);
      }
    } catch (e) {
      /* ignore */
    }
  };

  const checkSave = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/favorites/check/${mangaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isFavorite);
      }
    } catch (e) {
      /* ignore */
    }
  };

  const incrementView = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/mangas/${mangaId}/view`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {
      /* ignore */
    }
  };

  // ============================================
  // ACTIONS
  // ============================================
  const handleLike = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    const newState = !isLiked;
    setIsLiked(newState);
    setLikeCount((prev) => (newState ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`${API_URL}/social/like-manga/${mangaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setIsLiked(!newState);
        setLikeCount((prev) => (newState ? prev - 1 : prev + 1));
      }
    } catch {
      setIsLiked(!newState);
      setLikeCount((prev) => (newState ? prev - 1 : prev + 1));
    } finally {
      setIsLiking(false);
    }
  }, [isLiked, isLiking, mangaId, router]);

  const handleSubscribe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (isSubscribing) return;

    setIsSubscribing(true);
    const newState = !isSubscribed;
    setIsSubscribed(newState);
    setSubCount((prev) => (newState ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`${API_URL}/social/subscribe/${mangaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setIsSubscribed(!newState);
        setSubCount((prev) => (newState ? prev - 1 : prev + 1));
      }
    } catch {
      setIsSubscribed(!newState);
      setSubCount((prev) => (newState ? prev - 1 : prev + 1));
    } finally {
      setIsSubscribing(false);
    }
  }, [isSubscribed, isSubscribing, mangaId, router]);

  const handleSave = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    const newState = !isSaved;
    setIsSaved(newState);

    try {
      const res = await fetch(`${API_URL}/favorites/toggle/${mangaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setIsSaved(!newState);
      }
    } catch {
      setIsSaved(!newState);
    } finally {
      setIsSaving(false);
    }
  }, [isSaved, isSaving, mangaId, router]);

  const handleShare = useCallback(async () => {
    const url = `https://ink-drop-one.vercel.app/manga/${mangaId}`;
    const title = manga?.title || "Manga";
    const text = `Découvre "${title}" sur INKDROP !`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(url);
          alert("Lien copié !");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Lien copié !");
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Lien copié !");
      }
    }
  }, [mangaId, manga]);

  // ============================================
  // RENDU
  // ============================================
  if (loading) return <Loader label="Chargement du manga..." />;

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-500 dark:text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Manga non trouvé
        </h2>
        <p className="text-muted-foreground max-w-md">
          {error || "Le manga que vous recherchez n'existe pas."}
        </p>
        <Link
          href="/discover"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-card flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-foreground/90 truncate max-w-[150px]">
            {manga.title}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-2 rounded-full hover:bg-card transition-colors ${
                isSaved
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-foreground"
              } disabled:opacity-50`}
              title="Enregistrer"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? "fill-blue-500" : ""}`} />
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

      {/* BANNIÈRE */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-background via-blue-950/40 to-background border-b border-border/40 relative overflow-hidden">
        {manga.coverUrl ? (
          <img
            src={manga.coverUrl}
            alt={manga.title}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        {manga.isPremium && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
            <Crown className="w-3 h-3" /> Premium
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-12 flex flex-col">
        {/* INFO MANGA */}
        <div className="bg-card/60 border border-border/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-lg space-y-4">
          {/* AUTEUR */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/40">
            <Link
              href={`/creator/${manga.author.username}`}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border/50">
                {manga.author.avatarUrl ? (
                  <img
                    src={manga.author.avatarUrl}
                    alt={manga.author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-500 bg-muted">
                    {manga.author.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
                  @{manga.author.username}
                  {manga.author.isCertified && (
                    <BadgeCheck
                      className="w-4 h-4"
                      fill={manga.author.badgeColor || "#3B82F6"}
                      color="black"
                      strokeWidth={1.5}
                    />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {manga.author.role === "CREATOR" ? "Créateur" : "Membre"}
                </p>
              </div>
            </Link>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {manga.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  manga.status === "ONGOING"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : manga.status === "COMPLETED"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                }`}
              >
                {manga.status === "ONGOING"
                  ? "En cours"
                  : manga.status === "COMPLETED"
                  ? "Terminé"
                  : "En pause"}
              </span>
            </div>
          </div>

          {manga.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {manga.description}
            </p>
          )}

          {/* STATS */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-500" />
              <span className="text-foreground font-medium">
                {formatCount(viewCount)}
              </span>{" "}
              vues
            </span>
            <span className="flex items-center gap-1.5">
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? "text-rose-500 fill-rose-500" : "text-rose-400"
                }`}
              />
              <span className="text-foreground font-medium">
                {formatCount(likeCount)}
              </span>{" "}
              likes
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-foreground font-medium">
                {formatCount(subCount)}
              </span>{" "}
              abonnés
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span className="text-foreground font-medium">
                {manga._count.chapters}
              </span>{" "}
              chapitres
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(manga.createdAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* GENRES */}
          {manga.genre && manga.genre.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {manga.genre.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-full bg-muted/70 text-foreground text-[10px] font-medium border border-border/50"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {isAuthor ? (
              <>
                <Link
                  href={`/creator/upload/chapter/${manga.id}`}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Ajouter un chapitre
                </Link>
                <Link
                  href={`/creator/manga/${manga.id}/edit`}
                  className="px-4 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground text-sm font-bold transition-all border border-border/50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Modifier
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isSubscribed
                      ? "bg-muted hover:bg-muted/80 text-foreground border border-border/50"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/20"
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  <Users className="w-4 h-4" />
                  {isSubscribed ? "Abonné" : "S'abonner"}
                </button>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`p-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isLiked
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                      : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked ? "fill-rose-500" : ""
                    }`}
                  />
                  <span className="text-xs">{formatCount(likeCount)}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* CHAPITRES */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Chapitres ({manga._count.chapters})
          </h2>

          {manga.chapters.length === 0 ? (
            <div className="text-center py-8 bg-card/30 rounded-2xl border border-border/40">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Aucun chapitre publié
              </p>
              {isAuthor && (
                <Link
                  href={`/creator/upload/chapter/${manga.id}`}
                  className="mt-3 inline-block px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all"
                >
                  Publier le premier chapitre
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {manga.chapters.map((ch) => {
                const badge = getAccessBadge(ch);
                const BadgeIcon = badge.icon;

                return (
                  <Link
                    key={ch.id}
                    href={`/manga/${manga.id}/chapter/${ch.number}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card/60 border border-border/60 hover:border-blue-500/40 transition-all hover:bg-card group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-sm font-bold text-blue-500 shrink-0">
                        #{ch.number}
                      </span>
                      <span className="text-sm font-medium text-foreground group-hover:text-blue-500 transition-colors truncate">
                        {ch.title || `Chapitre ${ch.number}`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 ${badge.className}`}
                      >
                        <BadgeIcon className="w-2.5 h-2.5" />
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {formatCount(ch.viewsCount)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>
                        {new Date(
                          ch.publishedAt || ch.createdAt,
                        ).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* COMMENTAIRES */}
        <div className="mt-8">
          <CommentSection mangaId={manga.id} chapterId={undefined} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
