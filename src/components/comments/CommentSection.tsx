"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, MessageCircle, Send, BadgeCheck, ChevronDown, ChevronUp } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
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
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Récupérer l'ID de l'utilisateur depuis le token
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

  // ✅ Récupérer les commentaires + état des likes
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const url = chapterId
          ? `${API_URL}/social/comments/chapter/${chapterId}`
          : `${API_URL}/social/comments/${mangaId}`;
        
        const res = await fetch(url);
        const data = await res.json();
        const commentsData = data.data || [];

        // ✅ Récupérer les likes de l'utilisateur
        const token = localStorage.getItem("token");
        let likedCommentIds: string[] = [];

        if (token) {
          try {
            const likesRes = await fetch(`${API_URL}/social/comment-likes`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (likesRes.ok) {
              likedCommentIds = await likesRes.json();
            }
          } catch (error) {
            console.error("Erreur récupération likes:", error);
          }
        }

        // ✅ Ajouter isLiked à chaque commentaire et ses réponses
        const addLikedState = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => ({
            ...comment,
            isLiked: likedCommentIds.includes(comment.id),
            replies: comment.replies ? addLikedState(comment.replies) : [],
          }));
        };

        setComments(addLikedState(commentsData));
      } catch (error) {
        console.error("Erreur chargement commentaires:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [mangaId, chapterId]);

  // ✅ Ajouter un commentaire
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

  // ✅ Ajouter une réponse
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
        
        // ✅ Si les réponses étaient fermées, les ouvrir
        setExpandedReplies((prev) => {
          const newSet = new Set(prev);
          newSet.add(parentId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Erreur ajout réponse:", error);
    }
  };

  // ✅ Like sur un commentaire - CORRIGÉ
  const handleLike = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/social/comment-like/${commentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Erreur lors du like");
      }

      const data = await res.json();

      // ✅ Mise à jour avec les données du backend
      const updateLikes = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: data.liked,
              likesCount: data.likesCount,
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateLikes(comment.replies),
            };
          }
          return comment;
        });
      };

      setComments((prev) => updateLikes(prev));
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  // ✅ Supprimer un commentaire
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
        // Recharger si erreur
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

  // ✅ Toggle affichage des réponses
  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
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

  // ✅ Composant d'affichage d'un commentaire
  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isAuthor = userId === comment.user.id;
    const badgeColor = comment.user.badgeColor || "#2563EB";
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);

    return (
      <div className={`${isReply ? "ml-6 md:ml-10 border-l-2 border-zinc-700/50 pl-4" : ""} border-b border-zinc-800/60 py-4`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-700">
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
            {/* En-tête */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">{comment.user.username}</span>
              {comment.user.isCertified && (
                <BadgeCheck
                  className="w-3.5 h-3.5"
                  fill={badgeColor}
                  color="black"
                  strokeWidth={1.5}
                />
              )}
              <span className="text-[10px] text-zinc-500">{formatDate(comment.createdAt)}</span>
              
              {/* ✅ Mention "En réponse à" pour les réponses */}
              {isReply && (
                <span className="text-[10px] text-zinc-500">
                  En réponse à <span className="text-zinc-300 font-medium">@{comment.parentUsername || "inconnu"}</span>
                </span>
              )}
            </div>

            {/* Contenu */}
            <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  comment.isLiked
                    ? "text-rose-500"
                    : "text-zinc-500 hover:text-rose-500"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? "fill-rose-500" : ""}`} />
                <span>{comment.likesCount || 0}</span>
              </button>

              {/* ✅ Bouton "Répondre" - UNIQUEMENT pour les commentaires de niveau 1 */}
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

            {/* ✅ Formulaire de réponse */}
            {replyTo === comment.id && !isReply && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Répondre à ${comment.user.username}...`}
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                  onKeyDown={(e) => e.key === "Enter" && handleAddReply(comment.id)}
                />
                <button
                  onClick={() => handleAddReply(comment.id)}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ✅ Bouton "Voir les réponses" */}
            {hasReplies && !isReply && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1 mt-3 text-xs text-zinc-500 hover:text-white transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {isExpanded
                    ? "Masquer les réponses"
                    : `Voir ${comment.replies?.length || 0} réponse${
                        (comment.replies?.length || 0) > 1 ? "s" : ""
                      }`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ✅ Affichage des réponses (seulement si expand) */}
        {hasReplies && !isReply && isExpanded && (
          <div className="mt-2 space-y-1">
            {comment.replies?.map((reply) => (
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

      {/* ✅ AJOUTER UN COMMENTAIRE */}
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

      {/* LISTE DES COMMENTAIRES */}
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
