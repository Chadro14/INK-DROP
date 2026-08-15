"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Heart, 
  Eye,
  BadgeCheck,
  Calendar,
  Share2,
  Plus,
  Users,
  Sparkles,
  Mail,
  Globe
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type CreatorProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  isCertified: boolean;
  premiumActive: boolean;
  createdAt: string;
  avatarColor: string | null;
  badgeColor?: string | null;
  _count: {
    mangas: number;
    followers: number;
    following: number;
  };
  mangas?: any[];
};

export default function CreatorPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // ============================================
  // RÉCUPÉRER LE CRÉATEUR
  // ============================================
  useEffect(() => {
    const fetchCreator = async () => {
      if (!username) {
        setError("Nom d'utilisateur manquant");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_URL}/users/username/${username}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Créateur "${username}" non trouvé`);
          }
          throw new Error("Erreur lors du chargement");
        }
        
        const data = await res.json();
        setCreator(data);
        setFollowersCount(data._count?.followers || 0);

        if (token) {
          const meRes = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUserId(meData.id);
            
            if (meData.id !== data.id) {
              const followRes = await fetch(`${API_URL}/follow/status/${data.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (followRes.ok) {
                const followData = await followRes.json();
                setIsFollowing(followData.following || false);
              }
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [username]);

  // ============================================
  // SUIVRE / NE PLUS SUIVRE
  // ============================================
  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!creator) return;

    try {
      const res = await fetch(`${API_URL}/follow/${creator.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsFollowing(data.following);
      setFollowersCount(prev => data.following ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Erreur follow:", error);
    }
  };

  // ============================================
  // PARTAGER
  // ============================================
  const handleShare = () => {
    const shareUrl = `https://ink-drop-one.vercel.app/creator/${username}`;
    if (navigator.share) {
      navigator.share({
        title: `INKDROP - ${username}`,
        text: `Découvre le profil de ${username} sur INKDROP !`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("📋 Lien copié !");
    }
  };

  // ============================================
  // AFFICHAGE
  // ============================================
  if (loading) {
    return <Loader message="Chargement du créateur" />;
  }

  if (error || !creator) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Créateur non trouvé</h1>
          <p className="text-zinc-400 text-sm mb-6">{error || "Le créateur que vous recherchez n'existe pas"}</p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === creator.id;
  const activeBadgeColor = creator.badgeColor || creator.avatarColor || "#3B82F6";

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90">
            @{creator.username.toLowerCase()}
          </span>
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-zinc-900 hover:text-white transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ===== BANNIÈRE ===== */}
      <div className="h-32 md:h-48 w-full bg-gradient-to-r from-zinc-950 via-blue-950/40 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-14 md:-mt-20 flex flex-col items-center">

        {/* ===== AVATAR ===== */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-900 overflow-hidden border-4 border-zinc-950 shadow-2xl ring-2 ring-blue-500/30 shrink-0">
            {creator.avatarUrl ? (
              <img 
                src={creator.avatarUrl} 
                alt={creator.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black text-blue-400 bg-gradient-to-br from-zinc-800 to-zinc-900">
                {creator.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          {creator.isCertified && (
            <div className="absolute bottom-1 right-1 bg-zinc-950 p-0.5 rounded-full shadow-lg">
              <BadgeCheck
                className="w-6 h-6 md:w-7 md:h-7"
                fill={activeBadgeColor}
                color="black"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* ===== NOM & BADGES ===== */}
        <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
          <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">{creator.username}</h1>
          {creator.isCertified && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold border border-blue-500/30">
              Certifié
            </span>
          )}
          {creator.premiumActive && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] md:text-xs font-black uppercase tracking-wider shadow-sm">
              PRO
            </span>
          )}
        </div>

        {/* ===== BIO ===== */}
        <p className="text-zinc-400 text-sm md:text-base text-center mb-3 max-w-md font-normal">
          {creator.bio || "Créateur sur INKDROP 🎨"}
        </p>

        {/* ===== INFOS ===== */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-zinc-500 mb-6">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-400" /> 
            {creator.email}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> 
            Membre depuis {new Date(creator.createdAt).toLocaleDateString()}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            {creator.role === 'CREATOR' ? 'Créateur' : 'Membre'}
          </span>
        </div>

        {/* ===== STATS SOCIALES ===== */}
        <div className="flex items-center justify-center gap-6 md:gap-12 py-3.5 px-6 md:px-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 w-full max-w-md md:max-w-lg mb-6 backdrop-blur-md shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-white">{creator._count?.following || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Abonnements</p>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-white">{followersCount}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Abonnés</p>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-blue-400">{creator._count?.mangas || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Mangas</p>
          </div>
        </div>

        {/* ===== BOUTONS D'ACTION ===== */}
        <div className="flex gap-2.5 w-full max-w-md md:max-w-lg mb-8">
          {isOwnProfile ? (
            <>
              <Link
                href="/profile/edit"
                className="flex-1 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="hidden sm:inline">Modifier</span>
                <span className="sm:hidden">✏️</span>
              </Link>
              <Link
                href="/creator/upload"
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Publier</span>
                <span className="sm:hidden">➕</span>
              </Link>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all flex items-center justify-center"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`flex-1 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                  isFollowing
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                }`}
              >
                {isFollowing ? "✅ Abonné" : "➕ S'abonner"}
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all flex items-center justify-center"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* ===== MANGAS PUBLIÉS ===== */}
        <div className="w-full max-w-md md:max-w-lg">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Mangas publiés
          </h2>

          {!creator.mangas || creator.mangas.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-6 text-center">
              <BookOpen className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-zinc-400 text-sm mt-2">Aucun manga publié pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {creator.mangas.map((manga: any) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group relative aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/60 hover:scale-[1.02] hover:border-blue-500/50 transition-all duration-200"
                >
                  {manga.coverUrl ? (
                    <img 
                      src={manga.coverUrl} 
                      alt={manga.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
                    <span className="flex items-center gap-1 text-white text-[10px] font-bold drop-shadow">
                      <Eye className="w-3 h-3 text-sky-400" /> {manga.viewsCount || 0}
                    </span>
                    <span className="flex items-center gap-1 text-white text-[10px] font-bold drop-shadow">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {manga.likesCount || 0}
                    </span>
                  </div>
                  <div className="absolute top-1.5 left-1.5">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-600/80 text-white border border-blue-400/30">
                      {manga.genre?.[0] || "Manga"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ===== SUIVI (si c'est le profil de l'utilisateur connecté) ===== */}
        {isOwnProfile && (
          <div className="w-full max-w-md md:max-w-lg mt-6">
            <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-4">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Votre communauté
              </h2>
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-white font-bold">{followersCount}</p>
                  <p className="text-zinc-500 text-xs">Abonnés</p>
                </div>
                <div>
                  <p className="text-white font-bold">{creator._count?.following || 0}</p>
                  <p className="text-zinc-500 text-xs">Abonnements</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}