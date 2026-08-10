"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
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
  Copy
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// ⚠️ Remplace cette URL par l'URL exacte de ton projet Supabase si besoin
const SUPABASE_STORAGE_URL = "https://YOUR_SUPABASE_PROJECT_ID.supabase.co/storage/v1/object/public/chapters";

/**
 * Helper pour garantir qu'on a toujours une URL complète d'image
 */
const getImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${SUPABASE_STORAGE_URL}/${url}`;
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

  const mangaId = params.id as string;

  // ============================================
  // RÉCUPÉRER LE MANGA
  // ============================================
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch(`${API_URL}/mangas/${mangaId}`);
        if (!res.ok) {
          throw new Error("Manga non trouvé");
        }
        const data = await res.json();
        setManga(data);

        const token = localStorage.getItem("token");
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
  // ABONNEMENT
  // ============================================
  const handleSubscribe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

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
    }
  };

  // ============================================
  // PARTAGER LE MANGA
  // ============================================
  const handleShare = () => {
    const shareUrl = `https://ink-drop-one.vercel.app/manga/${mangaId}`;
    const shareText = `📚 Découvre "${manga?.title}" sur INKDROP !`;

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
  // ALLER AUX COMMENTAIRES
  // ============================================
  const goToComments = () => {
    // Rediriger vers la page des commentaires du manga
    router.push(`/manga/${mangaId}/comments`);
  };

  // ============================================
  // AFFICHAGE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
        <p className="text-gray-500 text-center">{error || "Manga non trouvé"}</p>
        <Link href="/discover" className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold">
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  const statusColors = {
    ONGOING: "bg-green-100 text-green-700 border-green-200",
    COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
    HIATUS: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const statusLabels = {
    ONGOING: "En cours",
    COMPLETED: "Terminé",
    HIATUS: "En pause",
  };

  const isAuthor = currentUserId && manga.author.id === currentUserId;
  const fullCoverUrl = getImageUrl(manga.coverUrl);
  const shareUrl = `https://ink-drop-one.vercel.app/manga/${mangaId}`;

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/discover" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black truncate max-w-[150px]">{manga.title}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare}
              className="text-gray-500 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100"
              title="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu de partage (copie de lien) */}
        {showShareMenu && (
          <div className="absolute top-full right-4 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 w-64">
            <p className="text-xs text-gray-500 font-medium mb-2">Partager ce manga</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-600 outline-none"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-xs mt-2 text-center">✅ Lien copié !</p>
            )}
          </div>
        )}
      </header>

      {/* ===== COUVERTURE ===== */}
      <div className="relative aspect-[2/3] bg-gray-200">
        {fullCoverUrl ? (
          <img
            src={fullCoverUrl}
            alt={manga.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-gray-400/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white">{manga.title}</h1>
          <Link href={`/creator/${manga.author.username}`} className="text-white/80 text-sm flex items-center gap-1 hover:text-white">
            <User className="w-3 h-3" />
            {manga.author.username}
          </Link>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <section className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{manga.viewsCount}</span>
          </div>
          <button onClick={handleLike} className="flex items-center gap-1 transition-colors">
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500"}`} />
            <span className={isLiked ? "text-red-500" : "text-gray-500"}>{manga.likesCount}</span>
          </button>
          <div className="flex items-center gap-1 text-gray-500">
            <span>📖 {manga.chapters?.length || 0}</span>
          </div>
          <button 
            onClick={handleSubscribe}
            className={`ml-auto px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              isSubscribed 
                ? "bg-gray-200 text-black hover:bg-gray-300" 
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isSubscribed ? "Abonné" : "S'abonner"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {manga.genre.map((g) => (
            <span key={g} className="px-3 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
              {g}
            </span>
          ))}
          <span className={`px-3 py-0.5 rounded-full text-xs border ${statusColors[manga.status as keyof typeof statusColors]}`}>
            {statusLabels[manga.status as keyof typeof statusLabels]}
          </span>
          {manga.isPremium && (
            <span className="px-3 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs border border-yellow-200">
              ⭐ Premium
            </span>
          )}
        </div>

        {/* ===== BOUTONS ACTIONS ===== */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={goToComments}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Commentaires ({manga.commentsCount || 0})
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>
      </section>

      {/* ===== DESCRIPTION ===== */}
      <section className="px-4 py-4 border-b border-gray-200">
        <p className="text-gray-600 text-sm leading-relaxed">
          {manga.description || "Aucune description disponible."}
        </p>
      </section>

      {/* ===== CHAPITRES ===== */}
      <section className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Chapitres</h2>
          {isAuthor && (
            <Link
              href={`/manga/${mangaId}/chapter/new`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter un chapitre
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
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-black transition-colors active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {chapterCoverUrl ? (
                        <img
                          src={chapterCoverUrl}
                          alt={chapter.title || `Chapitre ${chapter.number}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-500">{chapter.number}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">{chapter.title || `Chapitre ${chapter.number}`}</p>
                      <p className="text-xs text-gray-400">
                        {chapter.pageCount ? `${chapter.pageCount} pages` : 'Pages inconnues'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {chapter.isFree ? (
                      <span className="text-xs text-green-600">Gratuit</span>
                    ) : (
                      <span className="text-xs text-gray-500">{chapter.price || 0.50}$</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Aucun chapitre publié</p>
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}