"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, MessageCircle, Send, BadgeCheck } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    isCertified: boolean;
    avatarColor: string;
    badgeColor?: string;
  };
  replies?: Comment[];
};

type CommentSectionProps = {
  mangaId: string;
  chapterId?: string;
};

export function CommentSection({ mangaId, chapterId }: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id);
      } catch (error) {
        console.error("Erreur token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const url = chapterId
          ? `${API_URL}/social/comments/chapter/${chapterId}`
          : `${API_URL}/social/comments/${mangaId}`;
        const res = await fetch(url);
        const data = await res.json();
        setComments(data.data || []);
      } catch (error) {
        console.error("Erreur chargement commentaires:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [mangaId, chapterId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/social/comment/${mangaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          chapterId: chapterId || null,
        }),
      });

      if (res.ok) {
        const newCommentData = await res.json();
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Erreur ajout commentaire:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/social/comment/${mangaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          chapterId: chapterId || null,
          parentId: parentId,
        }),
      });

      if (res.ok) {
        const newReply = await res.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? { ...comment, replies: [...(comment.replies || []), newReply] }
              : comment
          )
        );
        setReplyTo(null);
        setReplyContent("");
      }
    } catch (error) {
      console.error("Erreur ajout réponse:", error);
    }
  };

  const handleLike = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likesCount: comment.likesCount + 1,
            };
          }
          return comment;
        })
      );

      const res = await fetch(`${API_URL}/social/comment-like/${commentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likesCount: comment.likesCount - 1,
              };
            }
            return comment;
          })
        );
      }
    } catch (error) {
      console.error("Erreur like:", error);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likesCount: comment.likesCount - 1,
            };
          }
          return comment;
        })
      );
    }
  };

  const handleDelete = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("Supprimer ce commentaire ?")) return;

    try {
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      const res = await fetch(`${API_URL}/social/comment/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const url = chapterId
          ? `${API_URL}/social/comments/chapter/${chapterId}`
          : `${API_URL}/social/comments/${mangaId}`;
        const fetchRes = await fetch(url);
        const data = await fetchRes.json();
        setComments(data.data || []);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      const url = chapterId
        ? `${API_URL}/social/comments/chapter/${chapterId}`
        : `${API_URL}/social/comments/${mangaId}`;
      const fetchRes = await fetch(url);
      const data = await fetchRes.json();
      setComments(data.data || []);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isAuthor = userId === comment.user.id;
    const badgeColor = comment.user.badgeColor || "#2563EB";

    return (
      <div className={`${isReply ? "ml-8" : ""} border-b border-zinc-800/60 py-4`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-700">
            {comment.user.avatarUrl ? (
              <img
                src={comment.user.avatarUrl}
                alt={comment.user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {comment.user.username?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">{comment.user.username}</span>
              {comment.user.isCertified && (
                <BadgeCheck
                  className="w-4 h-4"
                  fill={badgeColor}
                  color="black"
                  strokeWidth={1.5}
                />
              )}
              <span className="text-xs text-zinc-500">{formatDate(comment.createdAt)}</span>
            </div>

            <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-500 transition-colors"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{comment.likesCount || 0}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Répondre
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {replyTo === comment.id && !isReply && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Écrire une réponse..."
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={() => handleAddReply(comment.id)}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Commentaires</h3>
        <span className="text-xs text-zinc-500">({comments.length})</span>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Écrire un commentaire..."
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          disabled={submitting || !newComment.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-zinc-500 py-8 text-sm">
          Aucun commentaire pour le moment. Soyez le premier !
        </p>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
