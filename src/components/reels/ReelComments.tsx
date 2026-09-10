"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Send,
  Trash2,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type CommentUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  isCertified: boolean;
  badgeColor: string | null;
};

type ReelComment = {
  id: string;
  userId: string;
  reelId: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  parentId: string | null;
  user: CommentUser;
  replies?: ReelComment[];
  repliesCount?: number;
};

interface Props {
  reelId: string;
  initialCount?: number;
  onClose?: () => void;
}

export function ReelComments({ reelId, initialCount = 0, onClose }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(initialCount);

  const [replyTo, setReplyTo] = useState<ReelComment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // CHARGER LES COMMENTAIRES
  // ============================================
  const fetchComments = async (pageNum: number) => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${API_URL}/reels/${reelId}/comments?page=${pageNum}&limit=20`,
        { headers }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur de chargement");
      }

      const newComments = data.data || [];
      if (pageNum === 1) {
        setComments(newComments);
      } else {
        setComments((prev) => [...prev, ...newComments]);
      }

      setTotalComments(data.meta?.total ?? newComments.length);
      setHasMore(pageNum < (data.meta?.totalPages || 1));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reelId) fetchComments(1);
  }, [reelId]);

  // ============================================
  // AJOUTER UN COMMENTAIRE
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/reels/${reelId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId: replyTo?.id || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi");
      }

      const newComment = data.data;

      // Si réponse → ajouter aux replies
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? {
                  ...c,
                  replies: [...(c.replies || []), newComment],
                  repliesCount: (c.repliesCount || 0) + 1,
                }
              : c
          )
        );
      } else {
        // Sinon → ajouter en haut
        setComments((prev) => [newComment, ...prev]);
      }

      setContent("");
      setReplyTo(null);
      setTotalComments((prev) => prev + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // LIKER UN COMMENTAIRE
  // ============================================
  const handleLike = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reels/comments/${commentId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        const updateComment = (c: ReelComment): ReelComment =>
          c.id === commentId
            ? {
                ...c,
                isLiked: data.liked,
                likesCount: data.likesCount ?? (data.liked ? c.likesCount + 1 : c.likesCount - 1),
              }
            : {
                ...c,
                replies: c.replies?.map(updateComment),
              };

        setComments((prev) => prev.map(updateComment));
      }
    } catch (err) {
      console.error("Erreur like commentaire:", err);
    }
  };

  // ============================================
  // SUPPRIMER UN COMMENTAIRE
  // ============================================
  const handleDelete = async (commentId: string, isReply = false, parentId?: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/reels/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (isReply && parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    replies: c.replies?.filter((r) => r.id !== commentId),
                    repliesCount: Math.max(0, (c.repliesCount || 0) - 1),
                  }
                : c
            )
          );
        } else {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
        setTotalComments((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  // ============================================
  // FORMAT DATE
  // ============================================
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`;
    return d.toLocaleDateString("fr-FR");
  };

  // ============================================
  // RENDU COMMENTAIRE
  // ============================================
  const renderComment = (comment: ReelComment, isReply = false) => (
    <div
      key={comment.id}
      className={`flex gap-3 ${isReply ? "ml-10 mt-3" : "py-3"}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
        style={{ backgroundColor: comment.user.avatarColor || "#8B5CF6" }}
      >
        {comment.user.avatarUrl ? (
          <img
            src={comment.user.avatarUrl}
            alt={comment.user.username}
            className="w-full h-full object-cover"
          />
        ) : (
          comment.user.username.charAt(0).toUpperCase()
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-xs font-semibold">
            @{comment.user.username}
          </span>
          {comment.user.isCertified && (
            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          )}
          <span className="text-white/40 text-[10px]">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <p className="text-white/90 text-sm break-words">{comment.content}</p>

        <div className="flex items-center gap-4 mt-1.5">
          {/* Like */}
          <button
            onClick={() => handleLike(comment.id)}
            className={`flex items-center gap-1 text-xs transition-all ${
              comment.isLiked ? "text-rose-500" : "text-white/50 hover:text-white"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${comment.isLiked ? "fill-rose-500" : ""}`}
            />
            <span>{comment.likesCount || 0}</span>
          </button>

          {/* Répondre (seulement si pas une réponse) */}
          {!isReply && (
            <button
              onClick={() => {
                setReplyTo(comment);
                inputRef.current?.focus();
              }}
              className="text-xs text-white/50 hover:text-white transition-all"
            >
              Répondre
            </button>
          )}

          {/* Supprimer (si l'utilisateur est l'auteur) */}
          {comment.user.id ===
            JSON.parse(localStorage.getItem("user") || "{}")?.id && (
            <button
              onClick={() => handleDelete(comment.id, isReply, comment.parentId || undefined)}
              className="text-xs text-rose-400/60 hover:text-rose-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDU PRINCIPAL
  // ============================================
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          {totalComments} commentaire{totalComments !== 1 ? "s" : ""}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-white/60 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* LISTE */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-10 h-10 text-white/20 mb-3" />
            <p className="text-white/50 text-sm">Aucun commentaire</p>
            <p className="text-white/30 text-xs mt-1">Soyez le premier à commenter</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id}>
                {renderComment(comment)}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="border-l border-zinc-800/40 ml-4">
                    {comment.replies.map((reply) => renderComment(reply, true))}
                  </div>
                )}
              </div>
            ))}

            {hasMore && (
              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchComments(next);
                }}
                className="w-full py-3 text-purple-400 hover:text-purple-300 text-xs font-medium transition-all"
              >
                Voir plus de commentaires
              </button>
            )}
          </>
        )}
      </div>

      {/* REPLY INDICATOR */}
      {replyTo && (
        <div className="px-4 py-2 bg-zinc-900/80 border-t border-zinc-800/60 flex items-center justify-between">
          <span className="text-white/60 text-xs">
            Répondre à <span className="text-purple-400">@{replyTo.user.username}</span>
          </span>
          <button
            onClick={() => setReplyTo(null)}
            className="text-white/40 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="px-4 py-2 bg-rose-950/40 border-t border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800/60 bg-zinc-950"
      >
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyTo ? `Répondre à @${replyTo.user.username}...` : "Ajouter un commentaire..."}
          className="flex-1 px-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-white placeholder-white/40 focus:border-purple-500 outline-none text-sm"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
