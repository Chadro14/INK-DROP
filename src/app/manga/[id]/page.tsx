"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  BookOpen,
  User,
  Calendar,
  Tag,
  ChevronRight,
  Share2,
  Bookmark,
  Plus,
  MessageCircle,
  Check,
  Copy,
  BadgeCheck,
  Globe,
  Sparkles,
  UserPlus,
  Crown
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

const getImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_URL}/storage/${url}`;
};

type Manga = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
    isCertified: boolean;
    badgeColor?: string;
  };
  status: string;
  genre: string[];
  viewsCount: number;
  likesCount: number;
  subscribersCount: number;
  commentsCount: number;
  isPremium: boolean;
  createdAt: string;
  chapters: {
    id: string;
    number: number;
    title: string;
    isFree: boolean;
    price: number;
    pageCount: number;
    publishedAt: string;
    coverUrl?: string | null;
  }[];
};

export default function MangaPage() {
  const params = useParams();
  const router = useRouter();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const mangaId = params.id as string;

  // ============================================
  // RÉCUPÉRER LE MANGA + STATUTS
  // ============================================
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Récupérer le manga
        const res = await fetch(`${API_URL}/mangas/${mangaId}`);
        if (!res.ok) {
          throw new Error("Manga non trouvé");
        }
        const data = await res.json();
        setManga(data);

        // Récupérer les statuts si connecté
        if (token) {
          const [likedRes, subRes, meRes] = await Promise.all([
            fetch(`${API_URL}/social/has-liked/${mangaId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/social/is-subscribed/${mangaId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          
          const likedData = await likedRes.json();
          const subData = await subRes.json();
          setIsLiked(likedData.liked || false);
          setIsSubscribed(subData.subscribed || false);

          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUserId(meData.id);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [mangaId]);

  // ============================================
  // LIKE
  // ============================================
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/social/like/${mangaId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsLiked(data.liked);
      setManga((prev) => prev ? {
        ...prev,
        likesCount: data.liked ? prev.likesCount + 1 : prev.likesCount - 1,
      } : null);
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  // ============================================
  // ABONNEMENT (AVEC SVG PUR)
  // ============================================
  const handleSubscribe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSubscribeLoading(true);
    try {
      const res = await fetch(`${API_URL}/social/subscribe/${mangaId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsSubscribed(data.subscribed);
      setManga((prev) => prev ? {
        ...prev,
        subscribersCount: data.subscribed ? prev.subscribersCount + 1 : prev.subscribersCount - 1,
      } : null);
    } catch (error) {
      console.error("Erreur abonnement:", error);
    } finally {
      setSubscribeLoading(false);
    }
  };

  // ============================================
  // PARTAGER
  // ============================================
  const handleShare = () => {
    const shareUrl = `https://ink-drop-one.vercel.app/manga/${mangaId}`;
    const shareText = `Découvre "${manga?.title}" sur INKDROP !`;

    if (navigator.share) {
      navigator.share({
        title: `${manga?.title} - INKDROP`,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyLink = async () => {
    const shareUrl = `https://ink-drop-one.vercel.app/manga/${mangaId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur copie:", err);
    }
  };

  // ============================================
  // NAVIGATION VERS LE CRÉATEUR
  // ============================================
  const goToCreator = () => {
    if (manga?.author?.username) {
      router.push(`/creator/${manga.author.username}`);
    }
  };

  // ============================================
  // AFFICHAGE
  // ============================================
  if (loading) {
    return <Loader message="Chargement du manga" />;
  }

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 px-4">
        <p className="text-zinc-400 text-center">{error || "Manga non trouvé"}</p>
        <Link href="/discover" className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all">
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  const statusColors = {
    ONGOING: "bg-green-950/40 text-green-400 border-green-500/30",
    COMPLETED: "bg-blue-950/40 text-blue-400 border-blue-500/30",
    HIATUS: "bg-yellow-950/40 text-yellow-400 border-yellow-500/30",
  };

  const statusLabels = {
    ONGOING: "En cours",
    COMPLETED: "Terminé",
    HIATUS: "En pause",
  };

  const isAuthor = currentUserId && manga.author.id === currentUserId;
  const fullCoverUrl = getImageUrl(manga.coverUrl);
  const authorBadgeColor = manga.author?.badgeColor || "#3B82F6";

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-white truncate max-w-[150px]">{manga.title}</span>
          <button
            onClick={handleShare}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Menu de partage */}
        {showShareMenu && (
          <div className="absolute top-full right-4 mt-2 bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-xl p-3 z-50 w-64 backdrop-blur-md">
            <p className="text-xs text-zinc-400 font-medium mb-2">Partager ce manga</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`https://ink-drop-one.vercel.app/manga/${mangaId}`}
                readOnly
                className="flex-1 px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 outline-none"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-xs mt-2 text-center">Lien copié</p>
            )}
          </div>
        )}
      </header>

      {/* ===== BANNIÈRE ===== */}
      <div className="relative aspect-[2/3] bg-zinc-900 border-b border-zinc-800/60">
        {fullCoverUrl ? (
          <img
            src={fullCoverUrl}
            alt={manga.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{manga.title}</h1>
          <div 
            onClick={goToCreator}
            className="inline-flex items-center gap-2 text-zinc-300 text-sm hover:text-blue-400 transition-colors cursor-pointer group mt-1"
          >
            <div className="relative">
              {manga.author.avatarUrl ? (
                <img
                  src={manga.author.avatarUrl}
                  alt={manga.author.username}
                  className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                  {manga.author.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              {/* ❌ BADGE CERTIFIÉ SUPPRIMÉ DE L'AVATAR */}
            </div>
            <span className="group-hover:text-blue-400 transition-colors">
              {manga.author.username}
            </span>
            {/* ✅ BADGE CERTIFIÉ DÉPLACÉ À LA FIN DU NOM */}
            {manga.author.isCertified && (
              <BadgeCheck
                className="w-4 h-4 text-blue-400"
                fill={authorBadgeColor}
                strokeWidth={1.5}
              />
            )}
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <section className="px-4 py-4 border-b border-zinc-800/60 bg-zinc-900/20">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1 text-zinc-400">
            <Eye className="w-4 h-4 text-blue-400" />
            <span>{manga.viewsCount}</span>
          </div>
          <button onClick={handleLike} className="flex items-center gap-1 transition-colors">
            <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-zinc-400 hover:text-rose-500"}`} />
            <span className={isLiked ? "text-rose-500" : "text-zinc-400"}>{manga.likesCount}</span>
          </button>
          <div className="flex items-center gap-1 text-zinc-400">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>{manga.chapters?.length || 0}</span>
          </div>
          {/* ✅ BOUTON S'ABONNER (CACHÉ SI C'EST L'AUTEUR) */}
          {!isAuthor && (
            <button
              onClick={handleSubscribe}
              disabled={subscribeLoading}
              className={`ml-auto px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isSubscribed
                  ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {subscribeLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSubscribed ? (
                <>
                  <Check className="w-4 h-4" />
                  Abonné
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  S'abonner
                </>
              )}
            </button>
          )}
          {/* ✅ SI C'EST L'AUTEUR, AFFICHER UN BADGE "VOTRE MANGA" */}
          {isAuthor && (
            <span className="ml-auto px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 flex items-center gap-1.5">
              <Check className="w-3 h-3" />
              Votre manga
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {manga.genre.map((g) => (
            <span key={g} className="px-3 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs">
              {g}
            </span>
          ))}
          <span className={`px-3 py-0.5 rounded-full text-xs border ${statusColors[manga.status as keyof typeof statusColors]}`}>
            {statusLabels[manga.status as keyof typeof statusLabels]}
          </span>
          {manga.isPremium && (
            <span className="px-3 py-0.5 rounded-full bg-yellow-950/40 text-yellow-400 text-xs border border-yellow-500/30 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => router.push(`/manga/${mangaId}/comments`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-white text-sm font-medium transition-colors border border-zinc-700/50"
          >
            <MessageCircle className="w-4 h-4 text-blue-400" />
            Commentaires ({manga.commentsCount || 0})
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-white text-sm font-medium transition-colors border border-zinc-700/50"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
            Partager
          </button>
        </div>
      </section>

      {/* ===== DESCRIPTION ===== */}
      <section className="px-4 py-4 border-b border-zinc-800/60">
        <p className="text-zinc-300 text-sm leading-relaxed">
          {manga.description || "Aucune description disponible."}
        </p>
      </section>

      {/* ===== CHAPITRES ===== */}
      <section className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Chapitres
          </h2>
          {isAuthor && (
            <Link
              href={`/manga/${mangaId}/chapter/new`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-900/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </Link>
          )}
        </div>
        <div className="space-y-2">
          {manga.chapters && manga.chapters.length > 0 ? (
            manga.chapters.map((chapter) => {
              const chapterCoverUrl = getImageUrl(chapter.coverUrl);
              return (
                <Link
                  key={chapter.id}
                  href={`/manga/${mangaId}/chapter/${chapter.number}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-blue-500/50 transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {chapterCoverUrl ? (
                        <img
                          src={chapterCoverUrl}
                          alt={chapter.title || `Chapitre ${chapter.number}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-zinc-500">{chapter.number}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {chapter.title || `Chapitre ${chapter.number}`}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {chapter.pageCount ? `${chapter.pageCount} pages` : 'Pages inconnues'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {chapter.isFree ? (
                      <span className="text-xs text-emerald-400 font-medium">Gratuit</span>
                    ) : (
                      <span className="text-xs text-zinc-400">{chapter.price || 0.50}$</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-zinc-700 mx-auto" />
              <p className="text-zinc-500 text-sm mt-2">Aucun chapitre publié</p>
            </div>
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
