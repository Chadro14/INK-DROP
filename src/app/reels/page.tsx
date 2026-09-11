"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { ReelComments } from "@/components/reels/ReelComments";
import {
  Heart,
  Bookmark,
  Share2,
  Play,
  BookOpen,
  User as UserIcon,
  Trophy,
  Sparkles,
  BadgeCheck,
  Volume2,
  VolumeX,
  PlayCircle,
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

type Manga = {
  id: string;
  title: string;
  slug?: string;
  coverUrl?: string | null;
};

type Chapter = {
  id: string;
  number: number;
  title?: string | null;
  mangaId: string;
};

type EventItem = {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
};

type Reel = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;

  // ✅ NOUVEAU : Trim virtuel
  trimStart?: number | null;
  trimEnd?: number | null;

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

// ============================================
// COULEUR D'ACCENT
// ============================================
const ACCENT_COLOR = "#8B5CF6";
const ACCENT_GLOW = "rgba(139, 92, 246, 0.4)";

// ============================================
// BADGE CERTIFIÉ
// ============================================
function CertifiedBadge({
  author,
  size = "sm",
}: {
  author: Author;
  size?: "sm" | "md";
}) {
  if (!author?.isCertified) return null;

  const badgeColor = author.badgeColor || author.avatarColor || "#3B82F6";
  const className = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <BadgeCheck
      className={className}
      fill={badgeColor}
      color="black"
      strokeWidth={1.5}
    />
  );
}

// ============================================
// CTA
// ============================================
function CtaButton({ reel }: { reel: Reel }) {
  const router = useRouter();

  const getDestination = (): string | null => {
    if (reel.chapter && reel.manga) {
      const mangaSlug = reel.manga.slug || reel.manga.id;
      return `/manga/${mangaSlug}/chapter/${reel.chapter.number}`;
    }
    if (reel.manga) {
      const mangaSlug = reel.manga.slug || reel.manga.id;
      return `/manga/${mangaSlug}`;
    }
    if (reel.event) {
      return `/events/${reel.event.id}`;
    }
    if (reel.featuredCreator) {
      return `/creator/${reel.featuredCreator.username}`;
    }
    return null;
  };

  const getIcon = () => {
    const type = reel.type || "";
    if (type.startsWith("MANGA")) return <BookOpen className="w-4 h-4" />;
    if (type.startsWith("EVENT")) return <Trophy className="w-4 h-4" />;
    if (type.startsWith("CREATOR")) return <UserIcon className="w-4 h-4" />;
    if (type === "INKDROP_OFFICIAL") return <Sparkles className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const getDefaultLabel = (): string => {
    if (reel.chapter) return "Lire le chapitre";
    if (reel.manga) return "Lire le manga";
    if (reel.event) return "Participer";
    if (reel.featuredCreator) return "Voir le profil";
    return "Découvrir";
  };

  const destination = getDestination();
  const label = reel.ctaLabel || getDefaultLabel();

  if (!destination) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        router.push(destination);
      }}
      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold transition-all shadow-lg border active:scale-95"
      style={{
        backgroundColor: ACCENT_COLOR,
        borderColor: `${ACCENT_COLOR}99`,
        boxShadow: `0 8px 24px ${ACCENT_GLOW}`,
      }}
    >
      {getIcon()}
      <span>{label}</span>
    </button>
  );
}

export default function ReelsPage() {
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isMuted, setIsMuted] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [likeAnimations, setLikeAnimations] = useState<Record<string, boolean>>(
    {}
  );
  const [bookmarkAnimations, setBookmarkAnimations] = useState<
    Record<string, boolean>
  >({});

  const [commentModalReelId, setCommentModalReelId] = useState<string | null>(
    null
  );
  const [commentModalCount, setCommentModalCount] = useState(0);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================
  // CHARGEMENT
  // ============================================
  const fetchReels = useCallback(async (pageNum: number) => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/reels?page=${pageNum}&limit=10`, {
        headers,
      });
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

      if (
        scrollTop + clientHeight >= scrollHeight - 200 &&
        hasMore &&
        !loadingMore
      ) {
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
  // AUTOPLAY + TRIM
  // ============================================
  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.pause();
      }
    });

    const currentReel = reels[currentIndex];
    if (currentReel && videoRefs.current[currentReel.id]) {
      const video = videoRefs.current[currentReel.id];
      if (video) {
        video.muted = isMuted;

        // ✅ Démarrer au trimStart si défini
        const startTime = currentReel.trimStart || 0;
        if (video.currentTime < startTime) {
          video.currentTime = startTime;
        }

        video.play().catch(() => {});
      }
    }
  }, [currentIndex, reels]);

  // ✅ Sync mute
  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const togglePlayPause = (reelId: string) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }

    setShowPlayOverlay(true);
    setTimeout(() => setShowPlayOverlay(false), 600);
  };

  // ============================================
  // TRIM HANDLERS (sur chaque vidéo)
  // ============================================
  const handleTimeUpdate = (
    e: React.SyntheticEvent<HTMLVideoElement>,
    reel: Reel
  ) => {
    const video = e.currentTarget;
    const trimEnd = reel.trimEnd;

    // ✅ Si on dépasse trimEnd → revenir à trimStart
    if (trimEnd && video.currentTime >= trimEnd) {
      video.currentTime = reel.trimStart || 0;
    }
  };

  const handleLoadedMetadata = (
    e: React.SyntheticEvent<HTMLVideoElement>,
    reel: Reel
  ) => {
    const video = e.currentTarget;
    // ✅ Positionner au trimStart si défini
    const trimStart = reel.trimStart || 0;
    if (trimStart > 0 && trimStart < video.duration) {
      video.currentTime = trimStart;
    }
  };

  // ============================================
  // LIKE (optimistic)
  // ============================================
  const handleLike = async (reelId: string, index: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // ✅ Animation
    setLikeAnimations((prev) => ({ ...prev, [reelId]: true }));
    setTimeout(() => {
      setLikeAnimations((prev) => ({ ...prev, [reelId]: false }));
    }, 400);

    // ✅ Optimistic update
    const previousReel = reels[index];
    const wasLiked = previousReel.isLiked;
    const newLiked = !wasLiked;

    setReels((prev) =>
      prev.map((reel, i) =>
        i === index
          ? {
              ...reel,
              isLiked: newLiked,
              likesCount: newLiked
                ? reel.likesCount + 1
                : Math.max(0, reel.likesCount - 1),
            }
          : reel
      )
    );

    // ✅ Envoi API
    try {
      const res = await fetch(`${API_URL}/reels/${reelId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setReels((prev) =>
          prev.map((reel, i) =>
            i === index
              ? {
                  ...reel,
                  isLiked: data.liked,
                  likesCount:
                    data.likesCount ??
                    (data.liked
                      ? reel.likesCount
                      : Math.max(0, reel.likesCount)),
                }
              : reel
          )
        );
      }
    } catch (error) {
      // ✅ Revert
      console.error("Erreur like:", error);
      setReels((prev) =>
        prev.map((reel, i) =>
          i === index
            ? {
                ...reel,
                isLiked: wasLiked,
                likesCount: previousReel.likesCount,
              }
            : reel
        )
      );
    }
  };

  // ============================================
  // BOOKMARK (optimistic)
  // ============================================
  const handleBookmark = async (reelId: string, index: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setBookmarkAnimations((prev) => ({ ...prev, [reelId]: true }));
    setTimeout(() => {
      setBookmarkAnimations((prev) => ({ ...prev, [reelId]: false }));
    }, 400);

    const previousReel = reels[index];
    const wasBookmarked = previousReel.isBookmarked;
    const newBookmarked = !wasBookmarked;

    setReels((prev) =>
      prev.map((reel, i) =>
        i === index ? { ...reel, isBookmarked: newBookmarked } : reel
      )
    );

    try {
      const res = await fetch(`${API_URL}/reels/${reelId}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setReels((prev) =>
          prev.map((reel, i) =>
            i === index ? { ...reel, isBookmarked: data.isBookmarked } : reel
          )
        );
      }
    } catch (error) {
      console.error("Erreur bookmark:", error);
      setReels((prev) =>
        prev.map((reel, i) =>
          i === index ? { ...reel, isBookmarked: wasBookmarked } : reel
        )
      );
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
      } catch (e) {}
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
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${API_URL}/reels/${reelId}/view`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId: localStorage.getItem("sessionId") }),
      });
    } catch (error) {}
  };

  const openCommentModal = (reelId: string, count: number) => {
    setCommentModalReelId(reelId);
    setCommentModalCount(count);
  };

  const incrementCommentCount = (reelId: string, delta: number) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === reelId
          ? { ...reel, commentsCount: Math.max(0, reel.commentsCount + delta) }
          : reel
      )
    );
  };

  // ============================================
  // LOADING / ERROR
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
          className="mt-4 px-6 py-2.5 rounded-full text-white font-semibold transition-all"
          style={{ backgroundColor: ACCENT_COLOR }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
        <div
          className="w-20 h-20 rounded-full border-2 flex items-center justify-center mb-6"
          style={{
            backgroundColor: `${ACCENT_COLOR}20`,
            borderColor: `${ACCENT_COLOR}60`,
          }}
        >
          <Play className="w-10 h-10" style={{ color: ACCENT_COLOR }} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Aucun reel</h1>
        <p className="text-white/60 text-center max-w-md">
          Soyez le premier à publier un reel sur INKDROP !
        </p>
        <Link
          href="/creator/upload/video"
          className="mt-6 px-6 py-2.5 rounded-full text-white font-semibold transition-all shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #A78BFA 100%)`,
            boxShadow: `0 8px 24px ${ACCENT_GLOW}`,
          }}
        >
          Publier un reel
        </Link>
      </div>
    );
  }

  // ============================================
  // RENDU
  // ============================================
  return (
    <>
      <div className="flex flex-col h-screen bg-black">
        {/* HEADER */}
        <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <span className="text-white font-bold text-lg tracking-tight">
              <span style={{ color: ACCENT_COLOR }}>Reels</span>
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
                className="w-full h-full object-contain cursor-pointer"
                loop
                playsInline
                muted={isMuted}
                onClick={() => togglePlayPause(reel.id)}
                onLoadedMetadata={(e) => handleLoadedMetadata(e, reel)}
                onTimeUpdate={(e) => handleTimeUpdate(e, reel)}
                onPlay={() => {
                  if (index === currentIndex) {
                    handleView(reel.id);
                  }
                }}
              />

              {/* OVERLAY PLAY/PAUSE */}
              {showPlayOverlay && index === currentIndex && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-in">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}

              {/* BOUTON MUTE/UNMUTE */}
              {index === currentIndex && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="absolute top-20 right-4 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition-all shadow-lg"
                  title={isMuted ? "Activer le son" : "Couper le son"}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* INFO BAS GAUCHE */}
              <div className="absolute bottom-28 left-4 z-10 max-w-[70%]">
                <Link
                  href={`/creator/${reel.author?.username || ""}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 mb-2 hover:opacity-80 transition-all"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0"
                    style={{
                      backgroundColor:
                        reel.author?.avatarColor || ACCENT_COLOR,
                    }}
                  >
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
                  <CertifiedBadge author={reel.author} size="sm" />
                </Link>

                <h2 className="text-white font-bold text-lg leading-tight">
                  {reel.title}
                </h2>
                {reel.description && (
                  <p className="text-white/80 text-sm mt-1 line-clamp-2">
                    {reel.description}
                  </p>
                )}

                <CtaButton reel={reel} />

                {reel.musicTitle && (
                  <p className="text-white/60 text-xs mt-2 flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {reel.musicTitle}{" "}
                    {reel.musicArtist && `- ${reel.musicArtist}`}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {reel.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-white/40 text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* ACTIONS DROITE */}
              <div className="absolute bottom-28 right-4 z-10 flex flex-col items-center gap-5">
                {/* LIKE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(reel.id, index);
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`p-3 rounded-full transition-all duration-200 ${
                      likeAnimations[reel.id] ? "scale-125" : "scale-100"
                    } ${
                      reel.isLiked
                        ? ""
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    style={
                      reel.isLiked
                        ? {
                            backgroundColor: "rgba(244, 63, 94, 0.3)",
                            color: "#F43F5E",
                          }
                        : {}
                    }
                  >
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        reel.isLiked ? "fill-rose-500 scale-110" : "scale-100"
                      }`}
                    />
                  </div>
                  <span className="text-white/80 text-xs font-medium">
                    {reel.likesCount || 0}
                  </span>
                </button>

                {/* COMMENTAIRES */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCommentModal(reel.id, reel.commentsCount);
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <span className="text-white/80 text-xs font-medium">
                    {reel.commentsCount || 0}
                  </span>
                </button>

                {/* BOOKMARK */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark(reel.id, index);
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`p-3 rounded-full transition-all duration-200 ${
                      bookmarkAnimations[reel.id] ? "scale-125" : "scale-100"
                    } ${
                      reel.isBookmarked
                        ? ""
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    style={
                      reel.isBookmarked
                        ? {
                            backgroundColor: "rgba(245, 158, 11, 0.3)",
                            color: "#F59E0B",
                          }
                        : {}
                    }
                  >
                    <Bookmark
                      className={`w-6 h-6 transition-all ${
                        reel.isBookmarked
                          ? "fill-amber-500 scale-110"
                          : "scale-100"
                      }`}
                    />
                  </div>
                  <span className="text-white/80 text-xs font-medium">
                    Sauvegarder
                  </span>
                </button>

                {/* SHARE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(reel);
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-white/80 text-xs font-medium">
                    Partager
                  </span>
                </button>
              </div>

              {/* PROGRESSION */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${((index + 1) / reels.length) * 100}%`,
                    backgroundColor: ACCENT_COLOR,
                  }}
                />
              </div>
            </div>
          ))}

          {loadingMore && (
            <div className="h-20 flex items-center justify-center bg-black">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{
                  borderColor: ACCENT_COLOR,
                  borderTopColor: "transparent",
                }}
              />
            </div>
          )}
        </div>

        <BottomNav />
      </div>

      {/* MODAL COMMENTAIRES */}
      {commentModalReelId && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div className="h-[75vh] rounded-t-3xl overflow-hidden border-t border-zinc-800">
            <ReelComments
              reelId={commentModalReelId}
              initialCount={commentModalCount}
              onClose={() => setCommentModalReelId(null)}
              onCommentAdded={(delta) =>
                incrementCommentCount(commentModalReelId, delta)
              }
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
