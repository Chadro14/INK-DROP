"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { ReelComments } from "@/components/reels/ReelComments";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  Play,
  MessageCircle,
  BookOpen,
  User as UserIcon,
  Trophy,
  Sparkles,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Author = {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  isCertified: boolean;
  badgeColor: string | null;
};

type Manga = { id: string; title: string; slug?: string };
type Chapter = { id: string; number: number; title?: string; mangaId: string };
type EventItem = { id: string; title: string; type: string };

type Reel = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  authorId: string;
  author: Author;
  musicTitle: string | null;
  musicArtist: string | null;
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  type?: string;
  ctaLabel?: string | null;
  manga?: Manga | null;
  chapter?: Chapter | null;
  event?: EventItem | null;
  featuredCreator?: Author | null;
};

export default function ReelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reelId = params?.id as string;

  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // ============================================
  // CHARGER LE REEL
  // ============================================
  useEffect(() => {
    if (!reelId) return;

    const fetchReel = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/reels/${reelId}`, { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Reel non trouvé");
        }

        setReel(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReel();
  }, [reelId]);

  // ============================================
  // AUTOPLAY
  // ============================================
  useEffect(() => {
    if (videoRef.current && reel) {
      videoRef.current.play().catch(() => {});
    }
  }, [reel]);

  // ============================================
  // INTERACTIONS
  // ============================================
  const handleLike = async () => {
    if (!reel) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reels/${reel.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setReel((prev) =>
          prev
            ? {
                ...prev,
                isLiked: data.liked,
                likesCount:
                  data.likesCount ??
                  (data.liked ? prev.likesCount + 1 : prev.likesCount - 1),
              }
            : null
        );
      }
    } catch (err) {
      console.error("Erreur like:", err);
    }
  };

  const handleBookmark = async () => {
    if (!reel) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reels/${reel.id}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setReel((prev) =>
          prev ? { ...prev, isBookmarked: data.isBookmarked } : null
        );
      }
    } catch (err) {
      console.error("Erreur bookmark:", err);
    }
  };

  const handleShare = async () => {
    if (!reel) return;
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
        alert("Lien copié !");
      } catch (e) {}
    }
  };

  // ============================================
  // CTA
  // ============================================
  const getCtaDestination = (): string | null => {
    if (!reel) return null;
    if (reel.chapter && reel.manga) {
      return `/manga/${reel.manga.slug || reel.manga.id}/chapter/${reel.chapter.number}`;
    }
    if (reel.manga) return `/manga/${reel.manga.slug || reel.manga.id}`;
    if (reel.event) return `/events/${reel.event.id}`;
    if (reel.featuredCreator) return `/creator/${reel.featuredCreator.username}`;
    return null;
  };

  const getCtaIcon = () => {
    const t = reel?.type || "";
    if (t.startsWith("MANGA")) return <BookOpen className="w-4 h-4" />;
    if (t.startsWith("EVENT")) return <Trophy className="w-4 h-4" />;
    if (t.startsWith("CREATOR")) return <UserIcon className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const getCtaLabel = () => {
    if (!reel) return "";
    if (reel.ctaLabel) return reel.ctaLabel;
    if (reel.chapter) return "Lire le chapitre";
    if (reel.manga) return "Lire le manga";
    if (reel.event) return "Participer";
    if (reel.featuredCreator) return "Voir le profil";
    return "Découvrir";
  };

  const ctaDestination = getCtaDestination();

  // ============================================
  // RENDU
  // ============================================
  if (loading) return <Loader label="Chargement du reel..." />;

  if (error || !reel) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
        <p className="text-white/60 text-center">{error || "Reel non trouvé"}</p>
        <Link
          href="/reels"
          className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-all"
        >
          Retour aux Reels
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-black relative">
        {/* HEADER */}
        <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-bold text-sm">Reel</span>
          <div className="w-9" />
        </header>

        {/* VIDÉO */}
        <div className="flex-1 relative flex items-center justify-center">
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.thumbnailUrl || undefined}
            className="w-full h-full object-contain"
            loop
            playsInline
            muted
            controls={false}
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.paused
                  ? videoRef.current.play()
                  : videoRef.current.pause();
              }
            }}
          />

          {/* INFO À GAUCHE */}
          <div className="absolute bottom-4 left-4 right-20 z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                {reel.author?.avatarUrl ? (
                  <img
                    src={reel.author.avatarUrl}
                    alt={reel.author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  reel.author?.username?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <span className="text-white font-semibold text-sm">
                @{reel.author?.username}
              </span>
              {reel.author?.isCertified && (
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              )}
            </div>

            <h2 className="text-white font-bold text-lg leading-tight">{reel.title}</h2>
            {reel.description && (
              <p className="text-white/80 text-sm mt-1 line-clamp-3">{reel.description}</p>
            )}

            {/* CTA */}
            {ctaDestination && (
              <button
                onClick={() => router.push(ctaDestination)}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/40 border border-purple-400/30 active:scale-95"
              >
                {getCtaIcon()}
                <span>{getCtaLabel()}</span>
              </button>
            )}

            {reel.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {reel.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-white/40 text-[10px]">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS À DROITE */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-4">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`p-3 rounded-full transition-all ${
                  reel.isLiked
                    ? "bg-rose-600/30 text-rose-500"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Heart className={`w-6 h-6 ${reel.isLiked ? "fill-rose-500" : ""}`} />
              </div>
              <span className="text-white/80 text-xs font-medium">{reel.likesCount || 0}</span>
            </button>

            <button
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center gap-1"
            >
              <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-white/80 text-xs font-medium">{reel.commentsCount || 0}</span>
            </button>

            <button
              onClick={handleBookmark}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`p-3 rounded-full transition-all ${
                  reel.isBookmarked
                    ? "bg-amber-600/30 text-amber-500"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Bookmark className={`w-6 h-6 ${reel.isBookmarked ? "fill-amber-500" : ""}`} />
              </div>
              <span className="text-white/80 text-xs font-medium">Sauvegarder</span>
            </button>

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1"
            >
              <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-white/80 text-xs font-medium">Partager</span>
            </button>
          </div>
        </div>

        {/* BARRE DE PROGRESSION */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div className="h-full bg-purple-500" style={{ width: "100%" }} />
        </div>
      </div>

      {/* MODAL COMMENTAIRES */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="h-[75vh] rounded-t-3xl overflow-hidden border-t border-zinc-800">
            <ReelComments
              reelId={reel.id}
              initialCount={reel.commentsCount}
              onClose={() => setShowComments(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
