"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { Heart, Bookmark, Share2, Play } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Author = {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  isCertified: boolean;
  badgeColor: string | null;
};

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
};

export default function ReelsPage() {
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================
  // CHARGEMENT DES REELS
  // ============================================
  const fetchReels = useCallback(async (pageNum: number) => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/reels?page=${pageNum}&limit=10`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du chargement");
      }

      if (pageNum === 1) {
        setReels(data.data || []);
      } else {
        setReels((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.data?.length === 10);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchReels(1);
  }, [fetchReels]);

  // ============================================
  // SCROLL INFINI
  // ============================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore && !loadingMore) {
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReels(nextPage);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, page, fetchReels]);

  // ============================================
  // AUTOPLAY
  // ============================================
  useEffect(() => {
    // Pause tous les videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.pause();
      }
    });

    // Play le video courant
    const currentReel = reels[currentIndex];
    if (currentReel && videoRefs.current[currentReel.id]) {
      const video = videoRefs.current[currentReel.id];
      if (video) {
        video.play().catch(() => {});
      }
    }
  }, [currentIndex, reels]);

  // ============================================
  // INTERACTIONS
  // ============================================
  const handleLike = async (reelId: string, index: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reels/${reelId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setReels((prev) =>
          prev.map((reel, i) =>
            i === index
              ? {
                  ...reel,
                  isLiked: data.liked,
                  likesCount: data.liked ? reel.likesCount + 1 : reel.likesCount - 1,
                }
              : reel
          )
        );
      }
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  const handleBookmark = async (reelId: string, index: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/reels/${reelId}/bookmark`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setReels((prev) =>
          prev.map((reel, i) =>
            i === index
              ? {
                  ...reel,
                  isBookmarked: data.bookmarked,
                }
              : reel
          )
        );
      }
    } catch (error) {
      console.error("Erreur bookmark:", error);
    }
  };

  const handleShare = async (reel: Reel) => {
    const shareUrl = `${window.location.origin}/reels/${reel.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: reel.description || "Regarde ce reel sur INKDROP !",
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Lien copié !");
      } catch (e) {
        console.error("Erreur copie:", e);
      }
    }
  };

  const handleView = async (reelId: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/reels/${reelId}/view`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId: localStorage.getItem("sessionId") }),
      });
    } catch (error) {
      // Silence les erreurs de view
    }
  };

  // ============================================
  // RENDU
  // ============================================
  if (loading) {
    return <Loader label="Chargement des reels..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
        <p className="text-white/60 text-center">{error}</p>
        <button
          onClick={() => {
            setError("");
            setLoading(true);
            fetchReels(1);
          }}
          className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
        <div className="w-20 h-20 rounded-full bg-purple-950/40 border-2 border-purple-500/40 flex items-center justify-center mb-6">
          <Play className="w-10 h-10 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Aucun reel</h1>
        <p className="text-white/60 text-center max-w-md">
          Soyez le premier à publier un reel sur INKDROP !
        </p>
        <Link
          href="/creator/upload/video"
          className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-600/20"
        >
          Publier un reel
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-black">
        {/* HEADER */}
        <header className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <span className="text-white font-bold text-lg tracking-tight">
              <span className="text-purple-400">Reels</span>
            </span>
            <Link
              href="/creator/upload/video"
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all border border-white/20"
            >
              + Publier
            </Link>
          </div>
        </header>

        {/* FEED VERTICAL */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-black"
            >
              {/* VIDÉO */}
              <video
                ref={(el) => {
                  videoRefs.current[reel.id] = el;
                }}
                src={reel.videoUrl}
                poster={reel.thumbnailUrl || undefined}
                className="w-full h-full object-contain"
                loop
                playsInline
                muted
                onPlay={() => {
                  if (index === currentIndex) {
                    handleView(reel.id);
                  }
                }}
              />

              {/* INFO EN BAS À GAUCHE */}
              <div className="absolute bottom-28 left-4 z-10 max-w-[70%]">
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
                    @{reel.author?.username || "utilisateur"}
                  </span>
                  {reel.author?.isCertified && (
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  )}
                </div>

                <h2 className="text-white font-bold text-lg leading-tight">{reel.title}</h2>
                {reel.description && (
                  <p className="text-white/80 text-sm mt-1 line-clamp-2">{reel.description}</p>
                )}
                {reel.musicTitle && (
                  <p className="text-white/60 text-xs mt-2 flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {reel.musicTitle} {reel.musicArtist && `- ${reel.musicArtist}`}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {reel.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-white/40 text-[10px]">#{tag}</span>
                  ))}
                </div>
              </div>

              {/* ACTIONS À DROITE */}
              <div className="absolute bottom-28 right-4 z-10 flex flex-col items-center gap-5">
                {/* Like */}
                <button
                  onClick={() => handleLike(reel.id, index)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`p-3 rounded-full transition-all ${
                    reel.isLiked
                      ? "bg-rose-600/30 text-rose-500"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}>
                    <Heart className={`w-6 h-6 ${reel.isLiked ? "fill-rose-500" : ""}`} />
                  </div>
                  <span className="text-white/80 text-xs font-medium">{reel.likesCount || 0}</span>
                </button>

                {/* Commentaires */}
                <button
                  onClick={() => router.push(`/reels/${reel.id}`)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-xs font-medium">{reel.commentsCount || 0}</span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={() => handleBookmark(reel.id, index)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`p-3 rounded-full transition-all ${
                    reel.isBookmarked
                      ? "bg-amber-600/30 text-amber-500"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}>
                    <Bookmark className={`w-6 h-6 ${reel.isBookmarked ? "fill-amber-500" : ""}`} />
                  </div>
                  <span className="text-white/80 text-xs font-medium">Sauvegarder</span>
                </button>

                {/* Partager */}
                <button
                  onClick={() => handleShare(reel)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-white/80 text-xs font-medium">Partager</span>
                </button>
              </div>

              {/* INDICATEUR DE PROGRESSION */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${((index + 1) / reels.length) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* LOADER INFINI */}
          {loadingMore && (
            <div className="h-20 flex items-center justify-center bg-black">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <BottomNav />
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
