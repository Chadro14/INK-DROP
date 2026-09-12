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
  Send,
  MessageCircle,
  Volume2,
  VolumeX,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

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
  author?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
    isCertified?: boolean;
  };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  user: {
    id: string;
    username: string;
    avatarUrl?: string | null;
    isCertified?: boolean;
  };
  replies?: Comment[];
  repliesCount?: number;
};

type Props = {
  userId: string;
  isOwner?: boolean;
  emptyHint?: string;
};

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
  // ESC POUR FERMER LE MODAL
  // ============================================
  useEffect(() => {
    if (!activeReel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveReel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeReel]);

  // ============================================
  // SCROLL LOCK QUAND MODAL OUVERT
  // ============================================
  useEffect(() => {
    if (activeReel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
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
              className="group relative block w-full aspect-[9/16] bg-muted rounded-lg overflow-hidden border border-border/60 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-200"
            >
              {/* Miniature */}
              {reel.thumbnailUrl ? (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <video
                  src={reel.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

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

      {/* ============================================
          MODAL PLAYER TIKTOK STYLE
      ============================================ */}
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
// MODAL TIKTOK STYLE
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

  const [muted, setMuted] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  const viewCountedRef = useRef(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

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
  // CHARGER LES COMMENTAIRES
  // ============================================
  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      setCommentsError("");

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/reels/${reel.id}/comments?page=1&limit=20`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error("Impossible de charger les commentaires");
        }

        const data = await res.json();
        setComments(Array.isArray(data.data) ? data.data : []);
      } catch (err: any) {
        setCommentsError(err.message || "Erreur");
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [reel.id]);

  // ============================================
  // TOGGLE LIKE
  // ============================================
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (liking) return;
    setLiking(true);

    // Optimistic
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
      // Rollback
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLiking(false);
    }
  };

  // ============================================
  // POSTER UN COMMENTAIRE
  // ============================================
  const handlePostComment = async () => {
    const token = localStorage.getItem("token");
    if (!token || !commentInput.trim() || postingComment) return;

    setPostingComment(true);
    setCommentsError("");

    try {
      const res = await fetch(`${API_URL}/reels/${reel.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentInput.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erreur lors de l'envoi");
      }

      const data = await res.json();
      if (data.data) {
        setComments((prev) => [data.data, ...prev]);
        setCommentInput("");
        onReelUpdate({ commentsCount: (reel.commentsCount || 0) + 1 });
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err: any) {
      setCommentsError(err.message);
    } finally {
      setPostingComment(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    return d.toLocaleDateString("fr-FR");
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-2xl bg-background md:border md:border-border/80 overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================
            HEADER
        ============================================ */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2 min-w-0">
            {reel.author?.avatarUrl ? (
              <img
                src={reel.author.avatarUrl}
                alt={reel.author.username}
                className="w-8 h-8 rounded-full border border-white/20 object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {reel.author?.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="min-w-0">
              {reel.author?.username && (
                <Link
                  href={`/creator/${reel.author.username}`}
                  className="text-sm font-bold text-white truncate hover:underline block"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{reel.author.username}
                </Link>
              )}
              <p className="text-[10px] text-white/70">{formatDate(reel.createdAt)}</p>
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

        {/* ============================================
            VIDÉO
        ============================================ */}
        <div className="flex-1 relative bg-black overflow-hidden">
          <video
            src={reel.videoUrl}
            controls
            autoPlay
            playsInline
            loop
            muted={muted}
            className="w-full h-full object-contain"
          />

          {/* Bouton mute flottant */}
          <button
            onClick={() => setMuted(!muted)}
            className="absolute top-16 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all z-20"
            aria-label={muted ? "Activer le son" : "Couper le son"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* ============================================
              ACTIONS FLOTTANTES (côté droit)
          ============================================ */}
          <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4">
            {/* LIKE */}
            <button
              onClick={handleLike}
              disabled={liking}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                  liked
                    ? "bg-rose-500/90 text-white"
                    : "bg-black/40 hover:bg-black/60 text-white"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-transform group-active:scale-90 ${
                    liked ? "fill-white" : ""
                  }`}
                />
              </div>
              <span className="text-white text-xs font-bold drop-shadow">
                {likesCount}
              </span>
            </button>

            {/* COMMENTAIRES (scroll vers section) */}
            <button
              onClick={() => {
                commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-white text-xs font-bold drop-shadow">
                {reel.commentsCount || 0}
              </span>
            </button>

            {/* VUES */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-white text-xs font-bold drop-shadow">
                {viewsCount}
              </span>
            </div>
          </div>

          {/* ============================================
              INFO EN BAS (titre + description)
          ============================================ */}
          <div className="absolute bottom-0 left-0 right-16 z-10 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            {reel.title && (
              <p className="text-white text-sm font-bold mb-1 line-clamp-1">
                {reel.title}
              </p>
            )}
            {reel.description && (
              <p className="text-white/80 text-xs line-clamp-2 mb-2">
                {reel.description}
              </p>
            )}
            {reel.ctaLabel && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-bold">
                {reel.ctaLabel}
              </span>
            )}
          </div>
        </div>

        {/* ============================================
            SECTION COMMENTAIRES
        ============================================ */}
        <div className="bg-background border-t border-border max-h-[45vh] flex flex-col">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between shrink-0">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-500" />
              Commentaires ({reel.commentsCount || 0})
            </p>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-xs">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Chargement des commentaires...
              </div>
            ) : commentsError ? (
              <div className="flex items-center gap-2 py-4 text-rose-500 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{commentsError}</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground text-xs">
                  Aucun commentaire pour l'instant
                </p>
                <p className="text-muted-foreground/70 text-[10px] mt-1">
                  Sois le premier à commenter
                </p>
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} formatDate={formatDate} />
                ))}
                <div ref={commentsEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border/60 bg-card/40 shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
                placeholder="Ajouter un commentaire..."
                maxLength={500}
                className="flex-1 px-3 py-2 rounded-full bg-background border border-border text-foreground placeholder-muted-foreground text-sm focus:border-purple-500 outline-none transition-all"
              />
              <button
                onClick={handlePostComment}
                disabled={postingComment || !commentInput.trim()}
                className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                aria-label="Envoyer"
              >
                {postingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMMENTAIRE ITEM
// ============================================
function CommentItem({
  comment,
  formatDate,
}: {
  comment: Comment;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      {comment.user?.avatarUrl ? (
        <img
          src={comment.user.avatarUrl}
          alt={comment.user.username}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {comment.user?.username?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-foreground truncate">
            @{comment.user?.username || "utilisateur"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 mt-0.5 break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

// ============================================
// SESSION ID (pour compter les vues anonymes)
// ============================================
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
