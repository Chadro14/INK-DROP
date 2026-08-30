"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { CommentSection } from "@/components/comments/CommentSection";
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Eye,
  Share2,
  Crown,
  BadgeCheck,
  Calendar,
  Users,
  Sparkles,
  AlertCircle,
  Plus,
  Edit,
  Star,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Manga = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  status: string;
  genre: string[];
  tags: string[];
  viewsCount: number;
  likesCount: number;
  subscribersCount: number;
  commentsCount: number;
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
  chapters: {
    id: string;
    number: number;
    title: string | null;
    contentType: string;
    isFree: boolean;
    price: number;
    viewsCount: number;
    createdAt: string;
    publishedAt: string | null;
  }[];
  _count: {
    chapters: number;
    comments: number;
    likes: number;
    subscriptions: number;
  };
};

export default function MangaPage() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params?.id as string;

  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/mangas/${mangaId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error("Manga non trouvé");
        }

        const data = await res.json();
        const mangaData = data.data || data;
        setManga(mangaData);
        setLikeCount(mangaData.likesCount || 0);
        setViewCount(mangaData.viewsCount || 0);
        setSubscriberCount(mangaData.subscribersCount || 0);

        // Vérifier l'utilisateur
        if (token) {
          const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            setUser(meData);
            setIsAuthor(mangaData.author.id === meData.id || meData.role === "ADMIN");
          }
        }

        // Incrémenter les vues
        await incrementView();

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (mangaId) {
      fetchManga();
    }
  }, [mangaId]);

  // ✅ INCRÉMENTER LES VUES
  const incrementView = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/mangas/${mangaId}/view`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error("Erreur incrémentation vue:", error);
    }
  };

  // ✅ GESTION DU LIKE
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/social/like-manga/${mangaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors du like");

      const data = await res.json();
      setIsLiked(data.liked);
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  // ✅ GESTION DE L'ABONNEMENT
  const handleSubscribe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/social/subscribe/${mangaId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors de l'abonnement");

      const data = await res.json();
      setIsSubscribed(data.subscribed);
      setSubscriberCount((prev) => (data.subscribed ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Erreur abonnement:", error);
    }
  };

  // ✅ VÉRIFIER LE STATUT DU LIKE
  useEffect(() => {
    const checkLikeStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/social/has-liked-manga/${mangaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.liked);
        }
      } catch (error) {
        console.error("Erreur vérification like:", error);
      }
    };

    if (mangaId) {
      checkLikeStatus();
    }
  }, [mangaId]);

  // ✅ VÉRIFIER LE STATUT DE L'ABONNEMENT
  useEffect(() => {
    const checkSubscribeStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/social/is-subscribed/${mangaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsSubscribed(data.subscribed);
        }
      } catch (error) {
        console.error("Erreur vérification abonnement:", error);
      }
    };

    if (mangaId) {
      checkSubscribeStatus();
    }
  }, [mangaId]);

  const handleShare = () => {
    const shareUrl = `https://ink-drop-one.vercel.app/manga/${mangaId}`;
    if (navigator.share) {
      navigator.share({
        title: manga?.title || "Manga",
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié !");
    }
  };

  if (loading) {
    return <Loader label="Chargement du manga..." />;
  }

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Manga non trouvé</h2>
        <p className="text-zinc-400 max-w-md">{error || "Le manga que vous recherchez n'existe pas."}</p>
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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90 truncate max-w-[150px]">
            {manga.title}
          </span>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ===== BANNIÈRE ===== */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-zinc-950 via-blue-950/40 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        {manga.coverUrl ? (
          <img
            src={manga.coverUrl}
            alt={manga.title}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        {manga.isPremium && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <Crown className="w-3 h-3 fill-amber-400" />
            Premium
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-12 flex flex-col">

        {/* ===== INFO MANGA ===== */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-lg space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{manga.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Link
                href={`/creator/${manga.author.username}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
              >
                @{manga.author.username}
                {manga.author.isCertified && (
                  <BadgeCheck
                    className="w-4 h-4"
                    fill={manga.author.badgeColor || "#3B82F6"}
                    color="black"
                  />
                )}
              </Link>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                manga.status === "ONGOING" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                manga.status === "COMPLETED" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {manga.status === "ONGOING" ? "En cours" :
                 manga.status === "COMPLETED" ? "Terminé" : "En pause"}
              </span>
            </div>
          </div>

          {manga.description && (
            <p className="text-zinc-400 text-sm leading-relaxed">{manga.description}</p>
          )}

          {/* ===== STATS ===== */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">{viewCount}</span> vues
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              <span className="text-white font-medium">{likeCount}</span> likes
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">{subscriberCount}</span> abonnés
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-medium">{manga._count.chapters}</span> chapitres
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-400" />
              {new Date(manga.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* ===== GENRES ===== */}
          {manga.genre && manga.genre.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {manga.genre.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-full bg-zinc-800/70 text-zinc-300 text-[10px] font-medium border border-zinc-700/50"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* ===== ACTIONS ===== */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {isAuthor ? (
              <>
                <Link
                  href={`/creator/upload/chapter/${manga.id}`}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un chapitre
                </Link>
                <Link
                  href={`/creator/manga/${manga.id}/edit`}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold transition-all border border-zinc-700/50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubscribe}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isSubscribed
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/50"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/20"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {isSubscribed ? "Abonné" : "S'abonner"}
                </button>
                <button
                  onClick={handleLike}
                  className={`p-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isLiked
                      ? "bg-rose-600/20 text-rose-400 border border-rose-500/30"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/50"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-400" : ""}`} />
                  <span className="text-xs">{likeCount}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ===== LISTE DES CHAPITRES ===== */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Chapitres ({manga._count.chapters})
          </h2>

          {manga.chapters.length === 0 ? (
            <div className="text-center py-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
              <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Aucun chapitre publié</p>
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
              {manga.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/read/${manga.id}/chapter/${chapter.number}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-blue-500/30 transition-all hover:bg-zinc-900/60 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-400">#{chapter.number}</span>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                      {chapter.title || `Chapitre ${chapter.number}`}
                    </span>
                    {chapter.isFree ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        Gratuit
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                        {chapter.price || 0.50}$
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {chapter.viewsCount}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>{new Date(chapter.publishedAt || chapter.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ===== SECTION COMMENTAIRES ===== */}
        <div className="mt-8">
          <CommentSection mangaId={manga.id} chapterId={undefined} />
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
