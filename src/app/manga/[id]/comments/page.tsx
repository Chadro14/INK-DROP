"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, MessageCircle, Heart, Trash2, CheckCircle, Send } from "lucide-react";

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
  };
};

export default function CommentsPage() {
  const params = useParams();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mangaTitle, setMangaTitle] = useState("");

  const mangaId = params.id as string;

  // Récupérer les commentaires
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le titre du manga
        const mangaRes = await fetch(`${API_URL}/mangas/${mangaId}`);
        if (mangaRes.ok) {
          const mangaData = await mangaRes.json();
          setMangaTitle(mangaData.title || "Manga");
        }

        // Récupérer les commentaires
        const commentsRes = await fetch(`${API_URL}/social/comments/${mangaId}`);
        if (commentsRes.ok) {
          const data = await commentsRes.json();
          setComments(data.data || []);
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    if (mangaId) {
      fetchData();
    }
  }, [mangaId]);

  // Ajouter un commentaire
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
        body: JSON.stringify({ content: newComment.trim(), chapterId: null }),
      });

      if (res.ok) {
        const newCommentData = await res.json();
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Liker un commentaire
  const handleLike = async (commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/social/comment-like/${commentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, likesCount: data.liked ? comment.likesCount + 1 : comment.likesCount - 1 }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  // Formater la date
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-white truncate">Commentaires - {mangaTitle}</span>
          <span className="text-xs text-zinc-500 ml-auto">{comments.length} commentaires</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">

        {/* Ajouter un commentaire */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrire un commentaire..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Liste des commentaires */}
        {comments.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Aucun commentaire pour le moment</p>
            <p className="text-xs text-zinc-600 mt-1">Soyez le premier à commenter !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
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
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                      )}
                      <span className="text-xs text-zinc-500">{formatDate(comment.createdAt)}</span>
                    </div>

                    <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>

                    <button
                      onClick={() => handleLike(comment.id)}
                      className="flex items-center gap-1 mt-2 text-xs text-zinc-500 hover:text-rose-500 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{comment.likesCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
