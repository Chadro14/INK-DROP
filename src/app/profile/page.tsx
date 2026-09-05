"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  BookOpen, 
  Heart, 
  Settings, 
  LogOut, 
  Edit, 
  Eye, 
  Mail, 
  Calendar, 
  Share2, 
  Award, 
  Zap, 
  Coins, 
  ChevronRight, 
  BadgeCheck, 
  Shield, 
  Palette,
  Grid,
  Sparkles,
  Globe,
  Crown,
  Bookmark,
  Bell,
  DollarSign,
  TrendingUp,
  QrCode,
  Ticket,
  Rocket,
  Briefcase,
  Star,
  User,
  Trophy,
  Film,
  Plus,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  isCertified: boolean;
  premiumActive: boolean;
  isPro?: boolean;
  premiumExpires: string | null;
  premiumPlan?: string | null;
  createdAt: string;
  manas: number;
  steamPoints: number;
  steamLevel: number;
  avatarColor: string | null;
  badgeColor?: string | null;
  _count: {
    mangas: number;
    followers: number;
    following: number;
    favorites?: number;
    likes?: number;
  };
  mangas?: any[];
  earnings?: {
    total: number;
    pending: number;
    paid: number;
  };
};

type TicketBalance = {
  username: string;
  tickets: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"mangas" | "stats" | "menu">("mangas");
  const [ticketBalance, setTicketBalance] = useState<TicketBalance | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [hasRejectedRequest, setHasRejectedRequest] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [profileRes, earningsRes, ticketRes, requestRes] = await Promise.all([
          fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/dashboard/earnings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/tickets/balance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/creator-request/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Erreur lors du chargement du profil");
        }

        const profileData = await profileRes.json();

        let earningsData = null;
        if (earningsRes.ok) {
          earningsData = await earningsRes.json();
        }

        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          setTicketBalance(ticketData);
        }

        if (requestRes.ok) {
          const requestData = await requestRes.json();
          if (requestData.status === "PENDING") setHasPendingRequest(true);
          if (requestData.status === "REJECTED") setHasRejectedRequest(true);
        }

        setProfile({
          ...profileData,
          earnings: earningsData || { total: 0, pending: 0, paid: 0 },
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleShare = () => {
    const username = profile?.username || "utilisateur";
    const shareUrl = `https://ink-drop-one.vercel.app/creator/${username}`;

    if (navigator.share) {
      navigator.share({
        title: `INKDROP - ${username}`,
        text: `Découvre le profil de ${username} sur INKDROP !`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié !");
    }
  };

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("Erreur chargement notifications non lues:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const totalEarnings = profile?.earnings?.total || 0;
  const isCreator = profile?.role === 'CREATOR' || profile?.role === 'ADMIN';
  const isAdmin = profile?.role === 'ADMIN';
  const isSuspended = profile?.role === 'SUSPENDED';

  // ===== ICÔNES =====
  const ManaCoin = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#manaGradient)" stroke="#FBBF24" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#D97706" strokeWidth="0.5" opacity="0.5"/>
      <text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="800" fill="#78350F" fontFamily="Arial, sans-serif">M</text>
      <defs>
        <linearGradient id="manaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D"/>
          <stop offset="50%" stopColor="#FBBF24"/>
          <stop offset="100%" stopColor="#F59E0B"/>
        </linearGradient>
      </defs>
    </svg>
  );

  const ProStar = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FC3F7"/>
          <stop offset="100%" stopColor="#00BCD4"/>
        </linearGradient>
      </defs>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
        fill="url(#proGrad)" stroke="#4FC3F7" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 6L13.5 9.5L17.5 10.5L14.5 13.5L15 17.5L12 15.5L9 17.5L9.5 13.5L6.5 10.5L10.5 9.5L12 6Z" 
        fill="white" opacity="0.3"/>
    </svg>
  );

  const CrownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="premiumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#4F46E5"/>
        </linearGradient>
      </defs>
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" 
        fill="url(#premiumGrad)" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 16H19V20H5V16Z" 
        fill="url(#premiumGrad)" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );

  if (loading) {
    return <Loader label="Chargement de votre profil" />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground px-4">
        <p className="text-muted-foreground text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (isSuspended) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center text-foreground">
        <div className="w-20 h-20 rounded-full bg-rose-950/40 border-2 border-rose-500/40 flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Compte suspendu</h1>
        <p className="text-muted-foreground max-w-md">
          Votre compte a été suspendu. Contactez l'équipe INKDROP pour plus d'informations.
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  const activeBadgeColor = profile.badgeColor || profile.avatarColor || "#3B82F6";

  // ============================================
  // BOUTON DE DEMANDE DE COMPTE CRÉATEUR
  // ============================================
  const renderCreatorButton = () => {
    if (isAdmin) return null;

    if (isCreator) {
      return (
        <Link
          href="/creator/dashboard"
          className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
        >
          <Briefcase className="w-4 h-4" />
          Tableau de bord créateur
        </Link>
      );
    }

    if (hasPendingRequest) {
      return (
        <div className="w-full px-4 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-medium flex items-center justify-center gap-2 cursor-default">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
            <path d="M12 2C6.477 2 2 6.477 2 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          Demande en attente
        </div>
      );
    }

    if (hasRejectedRequest) {
      return (
        <Link
          href="/creator-request"
          className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-sm font-bold transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Nouvelle demande
        </Link>
      );
    }

    return (
      <Link
        href="/creator-request"
        className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group"
      >
        <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Devenir créateur</span>
        <Sparkles className="w-3.5 h-3.5 text-blue-300" />
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground selection:bg-blue-500 selection:text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="text-base font-bold tracking-tight text-foreground/90">
            @{profile.username.toLowerCase()}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Link
              href="/profile/qr-code"
              className="p-2 rounded-full hover:bg-card hover:text-foreground transition-all relative"
              title="Mon QR Code"
            >
              <QrCode className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </Link>
            <Link
              href="/notifications"
              className="relative p-2 rounded-full hover:bg-card hover:text-foreground transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-card hover:text-foreground transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== BANNIÈRE ===== */}
      <div className="h-32 md:h-48 w-full bg-gradient-to-r from-background via-blue-950/40 to-background border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        {isCreator && (
          <div className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-blue-400" />
            Créateur
          </div>
        )}
        {profile.premiumActive && (
          <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-400 text-[10px] font-bold flex items-center gap-1.5">
            <Crown className="w-3 h-3 fill-violet-400" />
            Premium
          </div>
        )}
        {profile.isPro && !profile.premiumActive && (
          <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-cyan-600/20 border border-cyan-400/30 text-cyan-400 text-[10px] font-bold flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-cyan-400" />
            Pro
          </div>
        )}
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-14 md:-mt-20 flex flex-col items-center">

        {/* ===== AVATAR ===== */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-muted overflow-hidden border-4 border-background shadow-2xl ring-2 ring-blue-500/30 shrink-0">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black text-blue-400 bg-gradient-to-br from-card to-muted">
                {profile.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          {profile.isCertified && (
            <div className="absolute -bottom-1 -right-1 bg-background p-0.5 rounded-full shadow-lg">
              <BadgeCheck
                className="w-6 h-6 md:w-7 md:h-7"
                fill={activeBadgeColor}
                color="black"
                strokeWidth={1.5}
              />
            </div>
          )}
          <Link
            href="/profile/settings?tab=avatar"
            className="absolute -bottom-1 -left-1 p-1.5 rounded-full bg-card hover:bg-muted border border-border/60 transition-all shadow-lg"
          >
            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>
        </div>

        {/* ===== NOM + BADGE ===== */}
        <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
          <h1 className="text-xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {profile.username}
          </h1>
          
          {profile.isPro && !profile.premiumActive && (
            <span className="relative">
              <span className="absolute inset-0 rounded-full blur-xl bg-cyan-400/30 animate-pulse" />
              <ProStar className="w-5 h-5 relative z-10" />
            </span>
          )}
          
          {profile.premiumActive && (
            <span className="relative">
              <span className="absolute inset-0 rounded-full blur-2xl bg-violet-500/40 animate-pulse" />
              <CrownIcon className="w-5 h-5 relative z-10" />
            </span>
          )}
        </div>

        {/* ===== BIO ===== */}
        <p className="text-muted-foreground text-sm md:text-base text-center mb-3 max-w-md font-normal">
          {profile.bio || "Membre INKDROP"}
        </p>

        {/* ===== INFOS ===== */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-400" /> 
            {profile.email}
          </span>
          <span className="w-1 h-1 rounded-full bg-muted" />
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> 
            Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <span className="w-1 h-1 rounded-full bg-muted" />
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            {isAdmin ? 'Administrateur' : isCreator ? 'Créateur' : 'Membre'}
          </span>
        </div>

        {/* ===== STATS SOCIALES + MANAS ===== */}
        <div className="flex items-center justify-center gap-6 md:gap-12 py-3.5 px-6 md:px-12 bg-card/40 rounded-2xl border border-border/60 w-full max-w-md md:max-w-lg mb-6 backdrop-blur-md shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-foreground">{profile._count?.following || 0}</p>
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Abonnements</p>
          </div>
          <div className="h-7 w-[1px] bg-muted" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-foreground">{profile._count?.followers || 0}</p>
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Abonnés</p>
          </div>
          <div className="h-7 w-[1px] bg-muted" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-amber-400 flex items-center justify-center gap-1.5">
              <ManaCoin className="w-6 h-6" />
              {profile.manas || 0}
            </p>
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium">MANAS</p>
          </div>
        </div>

        {/* ===== BOUTONS PUBLIER ===== */}
        <div className="w-full max-w-md mb-4 grid grid-cols-2 gap-3">
          <Link
            href="/creator/upload"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            <BookOpen className="w-4 h-4" />
            Publier un manga
          </Link>
          <Link
            href="/creator/upload/video"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/20"
          >
            <Film className="w-4 h-4" />
            Publier un Reel
          </Link>
        </div>

        {/* ===== BOUTON CRÉATEUR ===== */}
        {!isAdmin && (
          <div className="w-full max-w-md mb-4">
            {renderCreatorButton()}
          </div>
        )}

        {/* ===== BARRE D'ONGLETS ===== */}
        <div className="flex border-b border-border/80 w-full max-w-md md:max-w-xl mb-6">
          <button
            onClick={() => setActiveTab("mangas")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "mangas"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Mangas ({profile._count?.mangas || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "stats"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Balance & Stats</span>
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "menu"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Avantages</span>
          </button>
        </div>

        {/* ===== TAB 1 : MANGAS ===== */}
        {activeTab === "mangas" && (
          <div className="w-full">
            {!profile.mangas || profile.mangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card/30 rounded-2xl border border-border/40 max-w-md mx-auto my-2">
                <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                <p className="text-muted-foreground mt-3 text-sm font-medium">Aucun manga publié</p>
                {isCreator ? (
                  <Link
                    href="/creator/upload"
                    className="mt-4 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow shadow-blue-600/20"
                  >
                    Publier ton premier projet
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-xs mt-2">Deviens créateur pour publier tes mangas</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                {profile.mangas.map((manga: any) => (
                  <Link
                    key={manga.id}
                    href={`/manga/${manga.id}`}
                    className="group relative aspect-[2/3] bg-muted rounded-lg overflow-hidden border border-border/60 hover:scale-[1.02] hover:border-blue-500/50 transition-all duration-200"
                  >
                    {manga.coverUrl || manga.imageUrl ? (
                      <img 
                        src={manga.coverUrl || manga.imageUrl} 
                        alt={manga.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2 bg-gradient-to-t from-background/90 via-background/40 to-transparent flex items-end justify-between">
                      <span className="flex items-center gap-1 text-foreground text-[10px] md:text-xs font-bold drop-shadow">
                        <Eye className="w-3 h-3 text-sky-400" /> {manga.viewsCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-foreground text-[10px] md:text-xs font-bold drop-shadow">
                        <Heart className="w-3 h-3 text-rose-500" /> {manga.likesCount || 0}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== TAB 2 : STATS & BALANCE ===== */}
        {activeTab === "stats" && (
          <div className="w-full max-w-xl mx-auto space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              {isCreator ? (
                <div className="bg-card/60 border border-border/80 rounded-2xl p-4 text-center">
                  <DollarSign className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                  <p className="text-base md:text-lg font-black text-foreground">
                    ${(profile.manas / 100).toFixed(2)}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Balance</p>
                </div>
              ) : (
                <div className="bg-card/60 border border-border/80 rounded-2xl p-4 text-center">
                  <ManaCoin className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-base md:text-lg font-black text-foreground">
                    {profile.manas}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium">MANAS</p>
                </div>
              )}

              {isCreator ? (
                <div className="bg-card/60 border border-border/80 rounded-2xl p-4 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                  <p className="text-base md:text-lg font-black text-foreground">
                    ${totalEarnings.toFixed(2)}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Revenus</p>
                </div>
              ) : (
                <div className="bg-card/60 border border-border/80 rounded-2xl p-4 text-center">
                  <Heart className="w-5 h-5 mx-auto text-rose-400 mb-1" />
                  <p className="text-base md:text-lg font-black text-foreground">
                    {profile._count?.likes || 0}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Likes reçus</p>
                </div>
              )}

              <Link
                href="/profile/tickets"
                className="bg-card/60 border border-border/80 rounded-2xl p-4 text-center hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Ticket className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-base md:text-lg font-black text-foreground">
                    {ticketBalance?.tickets || 0}
                  </span>
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                  Tickets
                  <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>
            </div>

            {isCreator && profile.earnings && (
              <div className="bg-card/40 border border-border/60 rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Détail des revenus
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-foreground font-bold">${profile.earnings.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payé</span>
                    <span className="text-emerald-400 font-medium">${profile.earnings.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">En attente</span>
                    <span className="text-amber-400 font-medium">${profile.earnings.pending.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card/40 border border-border/60 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mes Tickets</p>
                    <p className="text-xs text-muted-foreground">
                      {ticketBalance?.tickets || 0} ticket{ticketBalance?.tickets !== 1 ? 's' : ''} disponible{ticketBalance?.tickets !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile/tickets"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Voir
                </Link>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                <Ticket className="w-3 h-3 inline mr-1 text-purple-400" />
                1 ticket = 1 chapitre payant débloqué
              </p>
            </div>
          </div>
        )}

        {/* ===== TAB 3 : AVANTAGES ===== */}
        {activeTab === "menu" && (
          <div className="w-full max-w-xl mx-auto bg-card/20 rounded-2xl border border-border/40 overflow-hidden">
            {/* Premium */}
            <Link
              href="/premium"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
            >
              {profile.premiumActive ? (
                <Crown className="w-5 h-5 text-violet-400" />
              ) : profile.isPro ? (
                <Star className="w-5 h-5 text-cyan-400" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground flex-1">
                {profile.premiumActive ? "Abonnement Premium actif" : 
                 profile.isPro ? "Abonnement Pro actif" : 
                 "Devenir Premium"}
              </span>
              {profile.premiumActive && (
                <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[9px] font-bold border border-violet-500/20 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Actif
                </span>
              )}
              {profile.isPro && !profile.premiumActive && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-bold border border-cyan-400/20 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Pro
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            {/* Mes événements */}
            <Link
              href="/profile/events"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-foreground flex-1">Mes événements</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            {/* Certification */}
            <Link
              href="/certification"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
            >
              <Award className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-foreground flex-1">Certification</span>
              {profile.isCertified && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Certifié
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            {/* Couleur du Badge */}
            {profile.isCertified && (
              <Link
                href="/profile/badge-color"
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
              >
                <Palette className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-foreground flex-1">Couleur du Badge</span>
                <div
                  className="w-5 h-5 rounded-full border border-muted shadow-inner"
                  style={{ backgroundColor: activeBadgeColor }}
                />
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            )}

            {/* Favoris */}
            <Link
              href="/favorites"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
            >
              <Bookmark className="w-5 h-5 text-rose-400" />
              <span className="text-sm font-medium text-foreground flex-1">Mes favoris</span>
              <span className="text-xs text-muted-foreground">({profile._count?.favorites || 0})</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            {/* Historique MANAS */}
            <Link
              href="/profile/manas-history"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
            >
              <ManaCoin className="w-5 h-5" />
              <span className="text-sm font-medium text-foreground flex-1">Historique MANAS</span>
              <span className="text-xs text-muted-foreground">({profile.manas || 0})</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            {/* Retrait d'argent */}
            {isCreator && (
              <Link
                href="/creator/balance"
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
              >
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-foreground flex-1">Retirer de l'argent</span>
                <span className="text-xs text-muted-foreground">≈ ${(profile.manas / 100).toFixed(2)}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            )}

            {/* Administration */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
              >
                <Shield className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-medium text-foreground flex-1">Administration</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[9px] font-bold border border-rose-500/20">
                  Admin
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            )}

            {/* Paramètres */}
            <Link
              href="/profile/settings"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors border-b border-border/30"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground flex-1">Paramètres du compte</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-card/50 transition-colors w-full text-rose-400 border-t border-border/30"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium flex-1 text-left">Se déconnecter</span>
              <ChevronRight className="w-4 h-4 text-rose-400/50" />
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
