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
  Plus,
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
  User,
  Globe,
  Users,
  Crown,
  Bookmark,
  Bell,
  Coins as ManasIcon,
  DollarSign,
  TrendingUp,
  Wallet,
  QrCode,
  Ticket,
  Menu,
  X,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

const COLORS = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  isCertified: boolean;
  premiumActive: boolean;
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
  const [activeTab, setActiveTab] = useState<"mangas" | "stats">("mangas");
  const [ticketBalance, setTicketBalance] = useState<TicketBalance | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [profileRes, earningsRes, ticketRes] = await Promise.all([
          fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/dashboard/earnings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/tickets/balance`, {
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

  if (loading) {
    return <Loader message="Chargement de votre profil" />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white px-4">
        <p className="text-zinc-500 text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const activeBadgeColor = profile.badgeColor || profile.avatarColor || COLORS.primary;

  const getPlanLabel = (plan?: string | null) => {
    if (!plan) return "Premium";
    const map: Record<string, string> = {
      MONTHLY: "Premium",
      YEARLY: "Premium Annuel",
    };
    return map[plan] || "Premium";
  };

  const planLabel = getPlanLabel(profile.premiumPlan);

  const menuItems = [
    { icon: <Crown className="w-5 h-5" />, label: profile.premiumActive ? "Abonnement Premium actif" : "Devenir Premium", href: "/premium", premium: true },
    { icon: <Award className="w-5 h-5" />, label: "Certification", href: "/certification" },
    { icon: <Palette className="w-5 h-5" />, label: "Couleur du Badge", href: "/profile/badge-color", show: profile.isCertified },
    { icon: <Bookmark className="w-5 h-5" />, label: "Mes favoris", href: "/favorites" },
    { icon: <Coins className="w-5 h-5" />, label: "Historique MANAS", href: "/profile/manas-history" },
    { icon: <DollarSign className="w-5 h-5" />, label: "Retirer de l'argent", href: "/creator/balance", show: isCreator },
    { icon: <Settings className="w-5 h-5" />, label: "Paramètres", href: "/profile/settings" },
    { icon: <Shield className="w-5 h-5" />, label: "Administration", href: "/admin/certify", show: profile.role === 'ADMIN' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-black text-white">

      {/* HEADER - TikTok Style */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="text-lg font-bold text-white">
            @{profile.username}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu déroulant - TikTok Style */}
        {showMenu && (
          <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-white/5 py-2 z-50">
            <div className="max-w-4xl mx-auto px-4">
              {menuItems.map((item, index) => {
                if (item.show === false) return null;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors ${
                      item.premium ? "text-amber-400" : "text-white"
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-30" />
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors w-full text-red-400"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Se déconnecter</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 flex flex-col items-center">

        {/* AVATAR & BIO - TikTok Style */}
        <div className="w-full flex flex-col items-center -mt-12">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-zinc-900 overflow-hidden border-4 border-black shadow-xl">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-400 bg-gradient-to-br from-zinc-800 to-zinc-900">
                  {profile.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            {profile.isCertified && (
              <div className="absolute -bottom-1 -right-1 bg-black p-0.5 rounded-full">
                <BadgeCheck className="w-6 h-6" fill={activeBadgeColor} color="black" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <h1 className="text-xl font-bold text-white">{profile.username}</h1>
            {profile.premiumActive && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-bold uppercase">
                <Crown className="w-3 h-3 inline mr-0.5 fill-current" />
                {planLabel}
              </span>
            )}
          </div>

          <p className="text-zinc-400 text-sm text-center mt-1 max-w-md">
            {profile.bio || "Créateur sur INKDROP"}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {profile.role === 'CREATOR' ? 'Créateur' : 'Membre'}
            </span>
          </div>
        </div>

        {/* STATS - TikTok Style (3 cartes alignées) */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-6">
          <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
            <p className="text-lg font-bold text-white">{profile._count?.following || 0}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Abonnements</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
            <p className="text-lg font-bold text-white">{profile._count?.followers || 0}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Abonnés</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
            <p className="text-lg font-bold text-blue-400 flex items-center justify-center gap-1">
              <ManasIcon className="w-4 h-4" />
              {profile.manas || 0}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">MANAS</p>
          </div>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="flex gap-2 w-full max-w-sm mt-4">
          <Link
            href="/profile/edit"
            className="flex-1 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
          <Link
            href="/creator/upload"
            className="flex-1 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Publier
          </Link>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* TABS - TikTok Style */}
        <div className="flex border-b border-white/10 w-full max-w-sm mt-6">
          <button
            onClick={() => setActiveTab("mangas")}
            className={`flex-1 py-3 text-center text-sm font-medium transition-all border-b-2 ${
              activeTab === "mangas"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>Mangas ({profile._count?.mangas || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 text-center text-sm font-medium transition-all border-b-2 ${
              activeTab === "stats"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>Stats</span>
          </button>
        </div>

        {/* CONTENU */}
        {activeTab === "mangas" && (
          <div className="w-full max-w-sm mt-4">
            {!profile.mangas || profile.mangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-2xl border border-white/5">
                <BookOpen className="w-10 h-10 text-zinc-700" />
                <p className="text-zinc-400 mt-3 text-sm">Aucun manga publié</p>
                <Link
                  href="/creator/upload"
                  className="mt-4 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-all"
                >
                  Publier ton premier projet
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {profile.mangas.map((manga: any) => (
                  <Link
                    key={manga.id}
                    href={`/manga/${manga.id}`}
                    className="group relative aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all"
                  >
                    {manga.coverUrl || manga.imageUrl ? (
                      <img src={manga.coverUrl || manga.imageUrl} alt={manga.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="text-white text-[9px] font-medium truncate">{manga.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="w-full max-w-sm mt-4 space-y-3">
            {/* Stats principales */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                {isCreator ? (
                  <>
                    <DollarSign className="w-5 h-5 mx-auto text-emerald-400" />
                    <p className="text-lg font-bold text-white">${(profile.manas / 100).toFixed(2)}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Balance</p>
                  </>
                ) : (
                  <>
                    <ManasIcon className="w-5 h-5 mx-auto text-blue-400" />
                    <p className="text-lg font-bold text-white">{profile.manas}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">MANAS</p>
                  </>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                {isCreator ? (
                  <>
                    <TrendingUp className="w-5 h-5 mx-auto text-blue-400" />
                    <p className="text-lg font-bold text-white">${totalEarnings.toFixed(2)}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Revenus</p>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mx-auto text-rose-400" />
                    <p className="text-lg font-bold text-white">{profile._count?.likes || 0}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Likes</p>
                  </>
                )}
              </div>

              <Link
                href="/profile/tickets"
                className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <Ticket className="w-5 h-5 mx-auto text-blue-400 group-hover:scale-110 transition-transform" />
                <p className="text-lg font-bold text-white">{ticketBalance?.tickets || 0}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center justify-center gap-1">
                  Tickets
                  <ChevronRight className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </Link>
            </div>

            {/* Tickets Info */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Mes Tickets</p>
                    <p className="text-xs text-zinc-500">
                      {ticketBalance?.tickets || 0} disponible(s)
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile/tickets"
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all"
                >
                  Voir
                </Link>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">
                <Ticket className="w-3 h-3 inline mr-1 text-blue-400" />
                1 ticket = 1 chapitre payant débloqué
              </p>
            </div>

            {/* Revenus détail */}
            {isCreator && profile.earnings && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Détail des revenus</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-white font-medium">${profile.earnings.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Payé</span>
                    <span className="text-emerald-400">${profile.earnings.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">En attente</span>
                    <span className="text-yellow-400">${profile.earnings.pending.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
