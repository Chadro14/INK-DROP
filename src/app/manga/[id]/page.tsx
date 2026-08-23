"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Share2, 
  Bookmark, 
  Check,
  Users,
  MessageCircle,
  Sparkles,
  Crown,
  Clock,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  User,
  Star,
  Verified
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Manga = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  status: "ONGOING" | "COMPLETED" | "HIATUS";
  genre: string[];
  viewsCount: number;
  likesCount: number;
  subscribersCount: number;
  commentsCount: number;
  isPremium: boolean;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    avatarColor: string | null;
    isCertified: boolean;
    badgeColor: string | null;
  };
  chapters: Array<{
    id: string;
    number: number;
    title: string | null;
    isFree: boolean;
    price: number;
    pageCount: number;
    publishedAt: string;
  }>;
};

type User = {
  id: string;
  premiumActive: boolean;
};

export default function MangaPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;
  const commentRef = useRef<HTMLDivElement>(null);

  const [manga, setManga] = useState<Manga | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isViewCounted, setIsViewCounted] = useState(false);

  // ============================================
  // SCROLL VERS LES COMMENTAIRES
  // ============================================
  const scrollToComments = () => {
    commentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ============================================
  // RÉCUPÉRER LE MANGA
  // ============================================
  useEffect(() => {
    const fetchManga = async () => {
      try {
        console.log("🔍 Chargement du manga:", mangaId);

        const res = await fetch(`${API_URL}/mangas/${mangaId}`);
        if (!res.ok) {
          throw new Error("Manga non trouvé");
        }

        const data = await res.json();
        console.log("📦 Données reçues:", data);

        setManga(data);
        setLikesCount(data.likesCount || 0);
        setViewsCount(data.viewsCount || 0);
        setSubscribersCount(data.subscribersCount || 0);

        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            
            const likeRes = await fetch(
              `${API_URL}/social/has-liked/${mangaId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (likeRes.ok) {
              const likeData = await likeRes.json();
              setIsLiked(likeData.liked);
            }
          }
        }

        if (!isViewCounted) {
          await incrementView();
        }

        console.log("✅ Chargement terminé");
      } catch (err: any) {
        console.error("❌ Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [mangaId]);

  // ============================================
  // INCRÉMENTER LES VUES
  // ============================================
  const incrementView = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/mangas/${mangaId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setViewsCount(data.viewsCount || viewsCount + 1);
        setIsViewCounted(true);
        console.log("✅ Vue incrémentée:", data.viewsCount);
      }
    } catch (err) {
      console.error("❌ Erreur vue:", err);
    }
  };

  // ============================================
  // GESTION DU LIKE
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erreur lors du like");
      }

      const data = await res.json();
      
      setIsLiked(data.liked);
      setLikesCount((prev) => data.liked ? prev + 1 : prev - 1);
      
      console.log(`✅ Like ${data.liked ? "ajouté" : "retiré"}`);
    } catch (err: any) {
      console.error("❌ Erreur like:", err);
      setIsLiked(!isLiked);
      setLikesCount((prev) => isLiked ? prev - 1 : prev + 1);
    }
  };

  // ============================================
  // AFFICHAGE - CHARGEMENT
  // ============================================
  if (loading) {
    return <Loader message="Chargement du manga" />;
  }

  // ============================================
  // AFFICHAGE - ERREUR
  // ============================================
  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
        <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
        <p className="text-zinc-400 text-center max-w-md">{error || "Manga non trouvé"}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // ============================================
  // AFFICHAGE - MANGA
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* ✅ Bouton retour vers l'accueil (pas vers le chapitre) */}
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Accueil</span>
          </Link>
          <span className="text-sm font-medium text-zinc-400 truncate max-w-[150px]">
            {manga.title}
          </span>
          <div className="w-9" />
        </div>
      </header>

      {/* COUVERTURE */}
      <div className="relative w-full aspect-[3/4] md:aspect-[3/2] bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden">
        {manga.coverUrl ? (
          <img
            src={manga.coverUrl}
            alt={manga.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <span className="text-zinc-700 text-6xl font-bold">?</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        
        {/* INFO SUR LA COUVERTURE */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                manga.status === "ONGOING" 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : manga.status === "COMPLETED"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {manga.status === "ONGOING" ? "En cours" : manga.status === "COMPLETED" ? "Terminé" : "En pause"}
              </span>
              {manga.isPremium && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Crown className="w-3 h-3 inline mr-1" />
                  Premium
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
              {manga.title}
            </h1>
            
            {/* ✅ AUTEUR AVEC AVATAR ET BADGE - RESTAURÉ */}
            <div className="flex items-center gap-3 mt-2">
              {/* Avatar */}
              {manga.author.avatarUrl ? (
                <img
                  src={manga.author.avatarUrl}
                  alt={manga.author.username}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-zinc-700 object-cover"
                />
              ) : (
                <div 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-zinc-700 flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: manga.author.avatarColor || "#3B82F6" }}
                >
                  {manga.author.username.charAt(0).toUpperCase()}
                </div>
              )}
              <Link
                href={`/creator/${manga.author.username}`}
                className="font-medium text-zinc-300 hover:text-blue-400 transition-colors text-sm md:text-base"
              >
                {manga.author.username}
              </Link>
              {/* ✅ Badge certifié - STYLISÉ */}
              {manga.author.isCertified && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <Verified className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400">Certifié</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STATS - LIKES, VUES, COMMENTAIRES */}
      <div className="max-w-4xl mx-auto w-full px-4 -mt-4 relative z-10">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 md:p-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* ✅ LIKE */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isLiked
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-700/30"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-400" : ""}`} />
              <span className="font-bold">{likesCount}</span>
            </button>

            {/* ✅ VUES */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/60 text-zinc-400 border border-zinc-700/30">
              <Eye className="w-5 h-5" />
              <span className="font-bold">{viewsCount}</span>
            </div>

            {/* ✅ COMMENTAIRES - BOUTON RESTAURÉ */}
            <button
              onClick={scrollToComments}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-zinc-700/30"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-bold">{manga.commentsCount || 0}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700/30">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700/30">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">

        {/* DESCRIPTION */}
        {manga.description && (
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5">
            <p className="text-zinc-300 text-sm leading-relaxed">{manga.description}</p>
          </div>
        )}

        {/* GENRES */}
        {manga.genre && manga.genre.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {manga.genre.map((g) => (
              <span
                key={g}
                className="px-3 py-1.5 bg-zinc-900/60 border border-zinc-800/60 rounded-full text-xs font-medium text-zinc-300"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* CHAPITRES */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
            <h2 className="font-bold text-white">Chapitres</h2>
            <span className="text-sm text-zinc-500">{manga.chapters.length} chapitres</span>
          </div>

          {manga.chapters.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              Aucun chapitre publié pour l'instant
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {manga.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/manga/${mangaId}/chapter/${chapter.number}`}
                  className="flex items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                      {chapter.number}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {chapter.title || `Chapitre ${chapter.number}`}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {chapter.pageCount || 0} pages
                        </span>
                        {chapter.isFree ? (
                          <span className="text-emerald-400 font-medium">Gratuit</span>
                        ) : (
                          <span className="text-amber-400 font-medium">{chapter.price || 0.50}$</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* STATS SUPPLEMENTAIRES - ABONNÉS CORRIGÉ */}
        <div className="grid grid-cols-3 gap-3">
          {/* ✅ ABONNÉS - maintenant avec subscribersCount */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-zinc-400 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-white">{subscribersCount}</p>
            <p className="text-xs text-zinc-500">Abonnés</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-zinc-400 mb-1">
              <MessageCircle className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-white">{manga.commentsCount || 0}</p>
            <p className="text-xs text-zinc-500">Commentaires</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-zinc-400 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-white">{manga.chapters.length}</p>
            <p className="text-xs text-zinc-500">Chapitres</p>
          </div>
        </div>

        {/* ✅ SECTION COMMENTAIRES - AVEC REF */}
        <div ref={commentRef}>
          {/* Le composant CommentSection sera rendu ici */}
          {/* Tu peux ajouter ton composant CommentSection existant ici */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 text-center text-zinc-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm">Section commentaires</p>
            <p className="text-xs text-zinc-600 mt-1">(À intégrer avec votre composant)</p>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
