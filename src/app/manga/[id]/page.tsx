"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { CommentSection } from "@/components/comments/CommentSection";

const API_URL = "https://ink-backend.vercel.app";

// ============================================
// SVG ICONS - 100% PUR
// ============================================

const IconArrowLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const IconShare = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
  </svg>
);

const IconBook = () => (
  <svg className="w-16 h-16 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

const IconEye = () => (
  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconHeart = ({ filled = false, className = "w-4 h-4" }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const IconUsers = () => (
  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const IconCalendar = () => (
  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconCrown = () => (
  <svg className="w-3 h-3 fill-amber-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M5 16H19V20H5V16Z" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const IconBadgeCheck = ({ color = "#3B82F6" }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color} stroke="black" strokeWidth="1.5">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const IconAlertCircle = () => (
  <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconLoader = ({ className = "w-8 h-8" }) => (
  <svg className={`${className} text-blue-500 animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

// ============================================
// TYPES
// ============================================

type Chapter = {
  id: string;
  number: number;
  title: string | null;
  contentType: string;
  isFree: boolean;
  price: number;
  viewsCount: number;
  createdAt: string;
  publishedAt: string | null;
};

type Manga = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  status: string;
  genre: string[];
  viewsCount: number;
  likesCount: number;
  subscribersCount: number;
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
  chapters: Chapter[];
  _count: {
    chapters: number;
    comments: number;
    likes: number;
    subscriptions: number;
  };
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

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
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [subCount, setSubCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/mangas/${mangaId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Manga non trouvé");

        const data = await res.json();
        const d = data.data || data;
        setManga(d);
        setLikeCount(d.likesCount || 0);
        setViewCount(d.viewsCount || 0);
        setSubCount(d.subscribersCount || 0);

        if (token) {
          const me = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (me.ok) {
            const meData = await me.json();
            setIsAuthor(d.author.id === meData.id || meData.role === "ADMIN");
          }
          await Promise.all([checkLike(token), checkSub(token)]);
        }

        await incrementView();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (mangaId) fetchData();
  }, [mangaId]);

  // ============================================
  // API HELPERS
  // ============================================

  const checkLike = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/social/has-liked-manga/${mangaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
      }
    } catch (e) { /* ignore */ }
  };

  const checkSub = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/social/is-subscribed/${mangaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsSubscribed(data.subscribed);
      }
    } catch (e) { /* ignore */ }
  };

  const incrementView = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/mangas/${mangaId}/view`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) { /* ignore */ }
  };

  // ============================================
  // ACTIONS AVEC FEEDBACK INSTANTANÉ
  // ============================================

  const handleLike = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    if (isLiking) return;

    setIsLiking(true);
    const newState = !isLiked;
    setIsLiked(newState);
    setLikeCount(prev => newState ? prev + 1 : prev - 1);

    try {
      const res = await fetch(`${API_URL}/social/like-manga/${mangaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setIsLiked(!newState);
        setLikeCount(prev => newState ? prev - 1 : prev + 1);
      }
    } catch {
      setIsLiked(!newState);
      setLikeCount(prev => newState ? prev - 1 : prev + 1);
    } finally {
      setIsLiking(false);
    }
  }, [isLiked, mangaId, router]);

  const handleSubscribe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    if (isSubscribing) return;

    setIsSubscribing(true);
    const newState = !isSubscribed;
    setIsSubscribed(newState);
    setSubCount(prev => newState ? prev + 1 : prev - 1);

    try {
      const res = await fetch(`${API_URL}/social/subscribe/${mangaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setIsSubscribed(!newState);
        setSubCount(prev => newState ? prev - 1 : prev + 1);
      }
    } catch {
      setIsSubscribed(!newState);
      setSubCount(prev => newState ? prev - 1 : prev + 1);
    } finally {
      setIsSubscribing(false);
    }
  }, [isSubscribed, mangaId, router]);

  const handleShare = useCallback(() => {
    const url = `https://ink-drop-one.vercel.app/manga/${mangaId}`;
    if (navigator.share) {
      navigator.share({ title: manga?.title || "Manga", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert("Lien copié !")).catch(() => {});
    }
  }, [mangaId, manga]);

  // ============================================
  // RENDU
  // ============================================

  if (loading) return <Loader label="Chargement du manga..." />;

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <IconAlertCircle />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Manga non trouvé</h2>
        <p className="text-zinc-400 max-w-md">{error || "Le manga que vous recherchez n'existe pas."}</p>
        <Link href="/discover" className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20">
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5">
            <IconArrowLeft />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90 truncate max-w-[150px]">{manga.title}</span>
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
            <IconShare />
          </button>
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-zinc-950 via-blue-950/40 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        {manga.coverUrl ? (
          <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><IconBook /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        {manga.isPremium && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <IconCrown /> Premium
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-12 flex flex-col">

        {/* INFO MANGA */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-lg space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{manga.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Link href={`/creator/${manga.author.username}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5">
                @{manga.author.username}
                {manga.author.isCertified && <IconBadgeCheck color={manga.author.badgeColor || "#3B82F6"} />}
              </Link>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                manga.status === "ONGOING" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                manga.status === "COMPLETED" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {manga.status === "ONGOING" ? "En cours" : manga.status === "COMPLETED" ? "Terminé" : "En pause"}
              </span>
            </div>
          </div>

          {manga.description && <p className="text-zinc-400 text-sm leading-relaxed">{manga.description}</p>}

          {/* STATS */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><IconEye /><span className="text-white font-medium">{viewCount}</span> vues</span>
            <span className="flex items-center gap-1.5"><IconHeart filled={isLiked} className="w-4 h-4 text-rose-400" /><span className="text-white font-medium">{likeCount}</span> likes</span>
            <span className="flex items-center gap-1.5"><IconUsers /><span className="text-white font-medium">{subCount}</span> abonnés</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-1.5"><IconBook className="w-4 h-4 text-emerald-400" /><span className="text-white font-medium">{manga._count.chapters}</span> chapitres</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-1.5"><IconCalendar />{new Date(manga.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
          </div>

          {/* GENRES */}
          {manga.genre && manga.genre.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {manga.genre.map(g => (
                <span key={g} className="px-2.5 py-0.5 rounded-full bg-zinc-800/70 text-zinc-300 text-[10px] font-medium border border-zinc-700/50">{g}</span>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {isAuthor ? (
              <>
                <Link href={`/creator/upload/chapter/${manga.id}`} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                  <IconPlus /> Ajouter un chapitre
                </Link>
                <Link href={`/creator/manga/${manga.id}/edit`} className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold transition-all border border-zinc-700/50 flex items-center gap-2">
                  <IconEdit /> Modifier
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isSubscribed
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/50"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/20"
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isSubscribing ? <IconLoader className="w-4 h-4" /> : <IconUsers />}
                  {isSubscribed ? "Abonné" : "S'abonner"}
                </button>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`p-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isLiked
                      ? "bg-rose-600/20 text-rose-400 border border-rose-500/30"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/50"
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isLiking ? <IconLoader className="w-4 h-4" /> : <IconHeart filled={isLiked} className="w-4 h-4" />}
                  <span className="text-xs">{likeCount}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* CHAPITRES */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <IconBook className="w-5 h-5 text-blue-400" />
            Chapitres ({manga._count.chapters})
          </h2>

          {manga.chapters.length === 0 ? (
            <div className="text-center py-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
              <IconBook className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Aucun chapitre publié</p>
              {isAuthor && (
                <Link href={`/creator/upload/chapter/${manga.id}`} className="mt-3 inline-block px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all">
                  Publier le premier chapitre
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {manga.chapters.map(ch => (
                <Link key={ch.id} href={`/read/${manga.id}/chapter/${ch.number}`} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-blue-500/30 transition-all hover:bg-zinc-900/60 group">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-400">#{ch.number}</span>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{ch.title || `Chapitre ${ch.number}`}</span>
                    {ch.isFree ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">Gratuit</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">{ch.price || 0.50}$</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><IconEye className="w-3 h-3" /> {ch.viewsCount}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>{new Date(ch.publishedAt || ch.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* COMMENTAIRES */}
        <div className="mt-8">
          <CommentSection mangaId={manga.id} chapterId={undefined} />
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
