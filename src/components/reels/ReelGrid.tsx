"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Film,
  Play,
  Eye,
  Heart,
  Lock,
  Clock,
  X,
  Loader2,
  AlertCircle,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  BadgeCheck,
  CheckCircle2,
} from "lucide-react";
import { ReelComments } from "@/components/reels/ReelComments";

const API_URL = "https://ink-backend.vercel.app";

const ACCENT_COLOR = "#8B5CF6";
const ACCENT_GLOW = "rgba(139, 92, 246, 0.4)";

type Author = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  isCertified?: boolean;
  badgeColor?: string | null;
};

type Reel = {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isPrivate: boolean;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  type?: string;
  ctaLabel?: string | null;
  isLiked?: boolean;
  author?: Author;
};

type Props = {
  userId: string;
  isOwner?: boolean;
  emptyHint?: string;
};

// ============================================
// BADGE CERTIFIÉ
// ============================================
function CertifiedBadge({
  author,
  size = "sm",
}: {
  author?: Author;
  size?: "sm" | "md";
}) {
  if (!author?.isCertified) return null;

  const badgeColor = author.badgeColor || author.avatarColor || "#3B82F6";
  const className = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <BadgeCheck
      className={className}
      fill={badgeColor}
      color="black"
      strokeWidth={1.5}
    />
  );
}

export function ReelGrid({ userId, isOwner = false, emptyHint }: Props) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  // ============================================
  // FETCH REELS
  // ============================================
  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const res = await fetch(`${API_URL}/reels/user/${userId}`, { headers });

        if (!res.ok) {
          throw new Error("Impossible de charger les reels");
        }

        const data = await res.json();
        setReels(Array.isArray(data.data) ? data.data : []);
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchReels();
  }, [userId]);

  // ============================================
  // ESC + SCROLL LOCK
  // ============================================
  useEffect(() => {
    if (!activeReel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveReel(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeReel]);

  // ============================================
  // LOADER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm font-medium">Chargement des reels...</span>
      </div>
    );
  }

  // ============================================
  // ERREUR
  // ============================================
  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-rose-500 dark:text-rose-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  // ============================================
  // VIDE
  // ============================================
  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card/30 rounded-2xl border border-border/40 max-w-md mx-auto my-2">
        <Film className="w-10 h-10 text-muted-foreground/50" />
        <p className="text-muted-foreground mt-3 text-sm font-medium">
          {emptyHint || "Aucun reel publié"}
        </p>
        {isOwner && (
          <Link
            href="/creator/upload/video"
            className="mt-4 px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow shadow-purple-600/20"
          >
            Publier mon premier Reel
          </Link>
        )}
      </div>
    );
  }

  // ============================================
  // GRILLE
  // ============================================
  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {reels.map((reel) => {
          const isUnpublished = reel.status !== "PUBLISHED";
          return (
            <button
              key={reel.id}
              type="button"
              onClick={() => setActiveReel(reel)}
              className="group relative block w-full aspect-[9/16] bg-black rounded-lg overflow-hidden border border-border/60 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-200"
            >
              <ReelThumbnail reel={reel} />

              {/* Overlay gradient + stats */}
              <div className="absolute inset-x-0 bottom-0 p-1.5 md:p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
                <span className="flex items-center gap-1 text-white text-[10px] md:text-xs font-bold drop-shadow">
                  <Eye className="w-3 h-3 text-sky-400" />
                  {reel.viewsCount || 0}
                </span>
                <span className="flex items-center gap-1 text-white text-[10px] md:text-xs font-bold drop-shadow">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  {reel.likesCount || 0}
                </span>
              </div>

              {/* Play icon au survol */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>

              {/* Badges (owner only) */}
              {isOwner && isUnpublished && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-white text-[9px] font-bold shadow">
                  {reel.status === "SCHEDULED" ? (
                    <>
                      <Clock className="w-2.5 h-2.5" />
                      Programm&eacute;
                    </>
                  ) : reel.isPrivate ? (
                    <>
                      <Lock className="w-2.5 h-2.5" />
                      Priv&eacute;
                    </>
                  ) : (
                    "Brouillon"
                  )}
                </div>
              )}

              {isOwner && reel.isPrivate && reel.status === "PUBLISHED" && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-900/90 text-white text-[9px] font-bold shadow">
                  <Lock className="w-2.5 h-2.5" />
                  Priv&eacute;
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* MODAL */}
      {activeReel && (
        <ReelModal
          reel={activeReel}
          onClose={() => setActiveReel(null)}
          onReelUpdate={(updated) => {
            setReels((prev) =>
              prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
            );
            setActiveReel((prev) => (prev ? { ...prev, ...updated } : null));
          }}
        />
      )}
    </>
  );
}

// ============================================
// THUMBNAIL avec fallback vidéo
// ============================================
function ReelThumbnail({ reel }: { reel: Reel }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (reel.thumbnailUrl && !imgFailed) {
    return (
      <img
        src={reel.thumbnailUrl}
        alt={reel.title}
        onError={() => setImgFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  return (
    <video
      src={`${reel.videoUrl}#t=0.1`}
      muted
      playsInline
      preload="metadata"
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

// ============================================
// MODAL STYLE TIKTOK
// ============================================
function ReelModal({
  reel,
  onClose,
  onReelUpdate,
}: {
  reel: Reel;
  onClose: () => void;
  onReelUpdate: (updated: Partial<Reel>) => void;
}) {
  const [liked, setLiked] = useState(reel.isLiked || false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [viewsCount, setViewsCount] = useState(reel.viewsCount || 0);
  const [liking, setLiking] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  const [muted, setMuted] = useState(true);

  // ✅ Animation fluide du bottom sheet
  const [commentsMounted, setCommentsMounted] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentsCount, setCommentsCount] = useState(reel.commentsCount || 0);

  // ✅ Toast interne
  const [toast, setToast] = useState<string | null>(null);

  const viewCountedRef = useRef(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // COMPTER LA VUE (une fois)
  // ============================================
  useEffect(() => {
    if (viewCountedRef.current) return;
    viewCountedRef.current = true;

    const countView = async () => {
      try {
        const token = localStorage.getItem("token");
        const sessionId = getOrCreateSessionId();

        const res = await fetch(`${API_URL}/reels/${reel.id}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.viewsCount && data.viewsCount > 0) {
            setViewsCount(data.viewsCount);
            onReelUpdate({ viewsCount: data.viewsCount });
          }
        }
      } catch (err) {
        console.error("Erreur comptage vue:", err);
      }
    };

    countView();
  }, [reel.id, onReelUpdate]);

  // ============================================
  // TOAST auto-dismiss
  // ============================================
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // ============================================
  // OUVERTURE / FERMETURE FLUIDE DU BOTTOM SHEET
  // ============================================
  const openComments = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setCommentsMounted(true);
    // Double rAF pour laisser le DOM monter avant la transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setCommentsVisible(true));
    });
  };

  const closeComments = () => {
    setCommentsVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setCommentsMounted(false);
      closeTimerRef.current = null;
    }, 320);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // ============================================
  // LIKE (optimistic)
  // ============================================
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token || liking) return;

    setLiking(true);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);

    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`${API_URL}/reels/${reel.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur");

      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likesCount);
      onReelUpdate({ likesCount: data.likesCount, isLiked: data.liked });
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLiking(false);
    }
  };

  // ============================================
  // SHARE
  // ============================================
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/reels/${reel.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: reel.description || "Regarde ce reel sur INKDROP !",
          url: shareUrl,
        });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setToast("Lien copié dans le presse-papier");
      } catch (e) {
        console.error("Erreur copie:", e);
      }
    }
  };

  // ============================================
  // COMMENTAIRES
  // ============================================
  const incrementCommentCount = (delta: number) => {
    setCommentsCount((prev) => Math.max(0, prev + delta));
    onReelUpdate({ commentsCount: Math.max(0, commentsCount + delta) });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-2xl overflow-hidden bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* VIDÉO */}
          <video
            src={reel.videoUrl}
            className="absolute inset-0 w-full h-full object-contain"
            autoPlay
            loop
            playsInline
            muted={muted}
          />

          {/* OVERLAY GRADIENT HAUT */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />

          {/* HEADER */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              {reel.author?.avatarUrl ? (
                <img
                  src={reel.author.avatarUrl}
                  alt={reel.author.username}
                  className="w-8 h-8 rounded-full border border-white/20 object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: reel.author?.avatarColor || ACCENT_COLOR,
                  }}
                >
                  {reel.author?.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0">
                {reel.author?.username && (
                  <Link
                    href={`/creator/${reel.author.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-bold text-white truncate hover:opacity-80 transition-opacity flex items-center gap-1.5"
                  >
                    @{reel.author.username}
                    <CertifiedBadge author={reel.author} size="sm" />
                  </Link>
                )}
                <p className="text-[10px] text-white/70">
                  {formatRelativeDate(reel.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* BOUTON MUTE */}
          <button
            onClick={() => setMuted(!muted)}
            className="absolute top-16 right-4 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition-all shadow-lg"
            aria-label={muted ? "Activer le son" : "Couper le son"}
          >
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          {/* INFO BAS GAUCHE */}
          <div className="absolute bottom-6 left-4 right-20 z-10">
            <h2 className="text-white font-bold text-base leading-tight mb-1">
              {reel.title}
            </h2>
            {reel.description && (
              <p className="text-white/80 text-sm line-clamp-2 mb-2">
                {reel.description}
              </p>
            )}
            {reel.ctaLabel && (
              <span
                className="inline-block px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg"
                style={{
                  backgroundColor: ACCENT_COLOR,
                  boxShadow: `0 8px 24px ${ACCENT_GLOW}`,
                }}
              >
                {reel.ctaLabel}
              </span>
            )}
          </div>

          {/* ACTIONS DROITE */}
          <div className="absolute bottom-6 right-3 z-10 flex flex-col items-center gap-5">
            {/* LIKE */}
            <button
              onClick={handleLike}
              disabled={liking}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`p-3 rounded-full transition-all duration-200 ${
                  likeAnim ? "scale-125" : "scale-100"
                } ${liked ? "" : "bg-white/10 hover:bg-white/20 text-white"}`}
                style={
                  liked
                    ? {
                        backgroundColor: "rgba(244, 63, 94, 0.3)",
                        color: "#F43F5E",
                      }
                    : {}
                }
              >
                <Heart
                  className={`w-6 h-6 transition-all ${
                    liked ? "fill-rose-500 scale-110" : "scale-100"
                  }`}
                />
              </div>
              <span className="text-white/80 text-xs font-medium">
                {likesCount}
              </span>
            </button>

            {/* COMMENTAIRES */}
            <button
              onClick={openComments}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-white/80 text-xs font-medium">
                {commentsCount}
              </span>
            </button>

            {/* VUES */}
            <div className="flex flex-col items-center gap-1">
              <div className="p-3 rounded-full bg-white/10 text-white">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-white/80 text-xs font-medium">
                {viewsCount}
              </span>
            </div>

            {/* SHARE */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-white/80 text-xs font-medium">
                Partager
              </span>
            </button>
          </div>

          {/* TOAST INTERNE */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-28 z-30 transition-all duration-300 ${
              toast
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium shadow-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toast}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SHEET COMMENTAIRES — ANIMATION FLUIDE */}
      {commentsMounted && (
        <div
          className={`fixed inset-0 z-[110] flex flex-col justify-end transition-all duration-300 ease-out ${
            commentsVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 backdrop-blur-0 opacity-0"
          }`}
          onClick={closeComments}
        >
          <div
            className={`h-[75vh] rounded-t-3xl overflow-hidden border-t border-border shadow-2xl transition-transform duration-300 ease-out ${
              commentsVisible ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <ReelComments
              reelId={reel.id}
              initialCount={commentsCount}
              onClose={closeComments}
              onCommentAdded={(delta) => incrementCommentCount(delta)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// HELPERS
// ============================================
function formatRelativeDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString("fr-FR");
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "inkdrop_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}
