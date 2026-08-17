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
  Star,
  Gift,
  Clock,
  Smartphone,
  CreditCard
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
  premiumExpires: string | null;
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
  };
  mangas?: any[];
  earnings?: {
    total: number;
    pending: number;
    paid: number;
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"mangas" | "stats" | "menu">("mangas");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [profileRes, earningsRes] = await Promise.all([
          fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/dashboard/earnings`, {
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

  if (loading) {
    return <Loader message="Chargement de votre profil" />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white px-4">
        <p className="text-zinc-400 text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const activeBadgeColor = profile.badgeColor || profile.avatarColor || "#3B82F6";

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="text-base font-bold tracking-tight text-white/90">
            @{profile.username.toLowerCase()}
          </span>
          <div className="flex items-center gap-2 md:gap-3 text-zinc-400">
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-zinc-900 hover:text-white transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <Link href="/profile/settings" className="p-2 rounded-full hover:bg-zinc-900 hover:text-white transition-all">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-zinc-900 hover:text-red-400 transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
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
          {/* ✅ SUPPRESSION DU BADGE CERTIFIÉ SUR L'AVATAR */}
        </div>

        {/* ===== NOM & BADGES ===== */}
        <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
          <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">{profile.username}</h1>
          {/* ✅ SUPPRESSION DU BADGE "Certifié" à côté du nom */}
          {profile.premiumActive && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] md:text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              PRO
            </span>
          )}
        </div>

        {/* ===== BIO ===== */}
        <p className="text-zinc-400 text-sm md:text-base text-center mb-3 max-w-md font-normal">
          {profile.bio || "Créateur sur INKDROP"}
        </p>

        {/* ===== INFOS ===== */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-zinc-500 mb-6">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-400" /> 
            {profile.email}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
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

        {/* ===== STATS SOCIALES ===== */}
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
            <p className="text-lg md:text-xl font-black text-blue-400">{profile.manas || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">MANAS</p>
          </div>
        </div>

        {/* ===== BOUTONS D'ACTION ===== */}
        <div className="flex gap-2.5 w-full max-w-md md:max-w-lg mb-8">
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
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all flex items-center justify-center"
            title="Partager"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* ===== BARRE D'ONGLETS ===== */}
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
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "stats"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Niveau & Stats</span>
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "menu"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
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
              <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/40 max-w-md mx-auto my-2">
                <BookOpen className="w-10 h-10 text-zinc-700" />
                <p className="text-zinc-400 mt-3 text-sm font-medium">Aucun manga publié</p>
                <Link
                  href="/creator/upload"
                  className="mt-4 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow shadow-blue-600/20"
                >
                  Publier ton premier projet
                </Link>
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

                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm(`Supprimer "${manga.title}" ?`)) {
                          const token = localStorage.getItem("token");
                          try {
                            const res = await fetch(`${API_URL}/mangas/${manga.id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (res.ok) {
                              window.location.reload();
                            } else {
                              alert("Erreur lors de la suppression");
                            }
                          } catch (error) {
                            alert("Erreur réseau");
                          }
                        }
                      }}
                      className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== TAB 2 : STATS ===== */}
        {activeTab === "stats" && (
          <div className="w-full max-w-xl mx-auto space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-center">
                <Zap className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                <p className="text-base md:text-lg font-black text-white">{profile.steamPoints || 0}</p>
                <p className="text-[10px] md:text-xs text-zinc-400 font-medium">Points Steam</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-center">
                <Award className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                <p className="text-base md:text-lg font-black text-white">Niv. {profile.steamLevel || 1}</p>
                <p className="text-[10px] md:text-xs text-zinc-400 font-medium">Niveau</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-center">
                <Coins className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                <p className="text-base md:text-lg font-black text-white">{profile.earnings?.total || 0}$</p>
                <p className="text-[10px] md:text-xs text-zinc-400 font-medium">Revenus</p>
              </div>
            </div>

            {/* ===== DÉTAIL DES REVENUS ===== */}
            {profile.earnings && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Détail des revenus
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-white font-bold">{profile.earnings.total}$</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Payé</span>
                    <span className="text-emerald-400">{profile.earnings.paid}$</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">En attente</span>
                    <span className="text-yellow-400">{profile.earnings.pending}$</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB 3 : MENU ===== */}
        {activeTab === "menu" && (
          <div className="w-full max-w-xl mx-auto space-y-2.5">
            
            {/* ===== BOUTON PREMIUM ===== */}
            <Link
              href="/premium"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-950/40 to-amber-950/20 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {profile.premiumActive ? "Abonnement Premium actif" : "Devenir Premium"}
                  </span>
                  {profile.premiumActive && profile.premiumExpires && (
                    <p className="text-[10px] text-zinc-500">
                      Valable jusqu'au {new Date(profile.premiumExpires).toLocaleDateString()}
                    </p>
                  )}
                  {!profile.premiumActive && (
                    <p className="text-[10px] text-zinc-500">
                      Accès illimité, sans pub, contenu exclusif
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* ===== CERTIFICATION ===== */}
            <Link
              href="/certification"
              className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold text-white">Demande de Certification</span>
                {profile.isCertified && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Certifié
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            {/* ===== BADGE COLOR ===== */}
            {profile.isCertified && (
              <Link
                href="/profile/badge-color"
                className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Couleur du Badge</span>
                  <div
                    className="w-4.5 h-4.5 rounded-full border border-zinc-700 shadow-inner"
                    style={{ backgroundColor: activeBadgeColor }}
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </Link>
            )}

            {/* ===== PARAMÈTRES ===== */}
            <Link
              href="/profile/settings"
              className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-semibold text-white">Paramètres du compte</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            {/* ===== ADMIN ===== */}
            {profile.role === 'ADMIN' && (
              <Link
                href="/admin/certify"
                className="flex items-center justify-between p-4 bg-blue-950/40 rounded-xl border border-blue-500/30 hover:border-blue-500/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Panneau d'administration</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </Link>
            )}

            {/* ===== DÉCONNEXION ===== */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-rose-950/30 rounded-xl border border-rose-500/30 hover:bg-rose-950/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-semibold text-rose-300">Se déconnecter</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
