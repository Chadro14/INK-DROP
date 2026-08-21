"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  User, 
  Grid,
  Heart,
  Eye,
  Share2,
  Plus,
  Edit,
  Crown,
  BadgeCheck,
  Globe,
  Check,
  UserPlus,
  MessageCircle,
  Settings,
  LogOut
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
  premiumPlan?: string | null;
  createdAt: string;
  avatarColor: string | null;
  badgeColor?: string | null;
  _count: {
    mangas: number;
    followers: number;
    following: number;
  };
  mangas?: any[];
  isFollowing?: boolean;
};

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [activeTab, setActiveTab] = useState<"mangas" | "about">("mangas");
  const [followLoading, setFollowLoading] = useState(false);

  // ============================================
  // RÉCUPÉRER LE PROFIL + STATUT FOLLOW
  // ============================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/users/username/${username}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error("Utilisateur non trouvé");
        }

        const data = await res.json();
        setProfile(data);

        // ✅ Vérifier le statut d'abonnement
        if (token) {
          try {
            const meRes = await fetch(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              setIsCurrentUser(meData.id === data.id);

              if (meData.id !== data.id) {
                const followRes = await fetch(`${API_URL}/follow/is-following/${data.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (followRes.ok) {
                  const followData = await followRes.json();
                  setIsFollowing(followData.following || false);
                }
              }
            }
          } catch (e) {
            console.error("Erreur vérification statut:", e);
          }
        }
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // ============================================
  // S'ABONNER / SE DÉSABONNER
  // ============================================
  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!profile) return;

    setFollowLoading(true);
    try {
      const res = await fetch(`${API_URL}/follow/${profile.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        const newStatus = data.following !== undefined ? data.following : true;
        setIsFollowing(newStatus);
        setProfile((prev) => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            followers: newStatus ? prev._count.followers + 1 : prev._count.followers - 1,
          },
        } : null);
      } else {
        console.error("Erreur follow:", data);
      }
    } catch (error) {
      console.error("Erreur follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // ============================================
  // PARTAGER LE PROFIL
  // ============================================
  const handleShare = () => {
    const shareUrl = `https://ink-drop-one.vercel.app/creator/${profile?.username}`;
    
    if (navigator.share) {
      navigator.share({
        title: `INKDROP - ${profile?.username}`,
        text: `Découvre le profil de ${profile?.username} sur INKDROP !`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié !");
    }
  };

  if (loading) {
    return <Loader message="Chargement du profil" />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
        <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-zinc-400 text-center">{error || "Utilisateur non trouvé"}</p>
        <Link
          href="/discover"
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  const activeBadgeColor = profile.badgeColor || profile.avatarColor || "#3B82F6";

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90">
            @{profile.username.toLowerCase()}
          </span>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-32 md:h-48 w-full bg-gradient-to-r from-zinc-950 via-blue-950/40 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-14 md:-mt-20 flex flex-col items-center">

        {/* AVATAR */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-900 overflow-hidden border-4 border-zinc-950 shadow-2xl ring-2 ring-blue-500/30 shrink-0">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black text-blue-400 bg-gradient-to-br from-zinc-800 to-zinc-900">
                {profile.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          {/* ✅ BADGE CERTIFIÉ SUR L'AVATAR (GARDÉ) */}
          {profile.isCertified && (
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

        {/* NOM & BADGES - ✅ BADGE CERTIFIÉ SUPPRIMÉ À CÔTÉ DU NOM */}
        <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
          <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">{profile.username}</h1>
          {profile.premiumActive && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] md:text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" />
              Premium
            </span>
          )}
        </div>

        {/* BIO */}
        <p className="text-zinc-400 text-sm md:text-base text-center mb-3 max-w-md font-normal">
          {profile.bio || "Créateur sur INKDROP"}
        </p>

        {/* INFOS - EMAIL SUPPRIMÉ */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-zinc-500 mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> 
            Membre depuis {new Date(profile.createdAt).toLocaleDateString()}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            {profile.role === 'CREATOR' ? 'Créateur' : 'Membre'}
          </span>
        </div>

        {/* STATS SOCIALES */}
        <div className="flex items-center justify-center gap-6 md:gap-12 py-3.5 px-6 md:px-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 w-full max-w-md md:max-w-lg mb-6 backdrop-blur-md shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-white">{profile._count?.following || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Abonnements</p>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-white">{profile._count?.followers || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Abonnés</p>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-blue-400">{profile._count?.mangas || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Mangas</p>
          </div>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="flex gap-2.5 w-full max-w-md md:max-w-lg mb-8">
          {isCurrentUser ? (
            <>
              <Link
                href="/profile/edit"
                className="flex-1 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Modifier le profil</span>
                <span className="sm:hidden">Modifier</span>
              </Link>
              <Link
                href="/creator/upload"
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Publier</span>
                <span className="sm:hidden">+</span>
              </Link>
            </>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex-1 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                isFollowing
                  ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {followLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isFollowing ? (
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
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all flex items-center justify-center"
            title="Partager"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* BARRE D'ONGLETS */}
        <div className="flex border-b border-zinc-800/80 w-full max-w-md md:max-w-xl mb-6">
          <button
            onClick={() => setActiveTab("mangas")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "mangas"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Mangas ({profile._count?.mangas || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "about"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <User className="w-4 h-4" />
            <span>À propos</span>
          </button>
        </div>

        {/* TAB 1 : MANGAS */}
        {activeTab === "mangas" && (
          <div className="w-full">
            {!profile.mangas || profile.mangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/40 max-w-md mx-auto my-2">
                <BookOpen className="w-10 h-10 text-zinc-700" />
                <p className="text-zinc-400 mt-3 text-sm font-medium">Aucun manga publié</p>
                {isCurrentUser && (
                  <Link
                    href="/creator/upload"
                    className="mt-4 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow shadow-blue-600/20"
                  >
                    Publier ton premier projet
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                {profile.mangas.map((manga: any) => (
                  <Link
                    key={manga.id}
                    href={`/manga/${manga.id}`}
                    className="group relative aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/60 hover:scale-[1.02] hover:border-blue-500/50 transition-all duration-200"
                  >
                    {manga.coverUrl || manga.imageUrl ? (
                      <img 
                        src={manga.coverUrl || manga.imageUrl} 
                        alt={manga.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
                      <span className="flex items-center gap-1 text-white text-[10px] md:text-xs font-bold drop-shadow">
                        <Eye className="w-3 h-3 text-sky-400" /> {manga.viewsCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-white text-[10px] md:text-xs font-bold drop-shadow">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {manga.likesCount || 0}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2 : À PROPOS */}
        {activeTab === "about" && (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 py-2 border-b border-zinc-800/40">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-300 text-sm">@{profile.username}</span>
              </div>
              {profile.bio && (
                <div className="flex items-start gap-3 py-2 border-b border-zinc-800/40">
                  <BookOpen className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span className="text-zinc-300 text-sm">{profile.bio}</span>
                </div>
              )}
              <div className="flex items-center gap-3 py-2 border-b border-zinc-800/40">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-300 text-sm">Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-zinc-800/40">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-300 text-sm">{profile.role === 'CREATOR' ? 'Créateur' : 'Membre'}</span>
              </div>
              {profile.isCertified && (
                <div className="flex items-center gap-3 py-2 border-b border-zinc-800/40">
                  <BadgeCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-zinc-300 text-sm">Compte certifié</span>
                </div>
              )}
              {profile.premiumActive && (
                <div className="flex items-center gap-3 py-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-zinc-300 text-sm">Abonnement Premium actif</span>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
