"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
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
  Sparkles
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
      alert("📋 Lien copié !");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white px-4">
        <p className="text-zinc-400 text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-all"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-amber-400 selection:text-black">

      {/* HEADER FIXE MINIMALISTE */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-base font-bold tracking-tight text-white/90">
            @{profile.username.toLowerCase()}
          </span>
          <div className="flex items-center gap-3 text-zinc-400">
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

      {/* BANNIÈRE DE COUVERTURE (Style TikTok / Twitter) */}
      <div className="h-28 md:h-36 w-full bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_50%)]" />
      </div>

      {/* CONTENU PROFIL CENTRÉ */}
      <main className="max-w-lg mx-auto w-full px-4 -mt-12 flex flex-col items-center">
        
        {/* AVATAR TIKTOK AVEC GLOW & BORDURE */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-zinc-900 overflow-hidden border-4 border-zinc-950 shadow-2xl ring-2 ring-zinc-800/80 shrink-0">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-amber-400 bg-gradient-to-br from-zinc-800 to-zinc-900">
                {profile.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          {profile.isCertified && (
            <div className="absolute bottom-1 right-1 bg-zinc-950 p-0.5 rounded-full shadow-lg">
              <BadgeCheck
                className="w-6 h-6"
                fill={profile.avatarColor || "#FFD700"}
                color="black"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* TITRE & BADGES */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{profile.username}</h1>
          {profile.premiumActive && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
              PRO
            </span>
          )}
        </div>

        {/* BIO & METADATA */}
        <p className="text-zinc-400 text-sm text-center mb-3 max-w-xs font-normal">
          {profile.bio || "Créateur sur INKDROP 🎨"}
        </p>

        <div className="flex items-center gap-3 text-xs text-zinc-500 mb-5">
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {profile.email}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(profile.createdAt).toLocaleDateString()}</span>
        </div>

        {/* COMPTEURS DE STATS STYLE TIKTOK */}
        <div className="flex items-center justify-center gap-8 py-3 px-6 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 w-full mb-5 backdrop-blur-md">
          <div className="text-center">
            <p className="text-lg font-black text-white">{profile._count?.following || 0}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Abonnements</p>
          </div>
          <div className="h-6 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <p className="text-lg font-black text-white">{profile._count?.followers || 0}</p>
            <p className="text-[11px] text-zinc-400 font-medium">Abonnés</p>
          </div>
          <div className="h-6 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <p className="text-lg font-black text-amber-400">{profile.manas || 0}</p>
            <p className="text-[11px] text-zinc-400 font-medium">MANAS</p>
          </div>
        </div>

        {/* BOUTONS D'ACTION STYLE TIKTOK (PILULES) */}
        <div className="flex gap-2 w-full mb-6">
          <Link
            href="/profile/edit"
            className="flex-1 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Modifier le profil
          </Link>
          <Link
            href="/creator/upload"
            className="px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Publier
          </Link>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all flex items-center justify-center"
            title="Partager"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* BARRE D'ONGLETS TYPE TIKTOK */}
        <div className="flex border-b border-zinc-800/80 w-full mb-4">
          <button
            onClick={() => setActiveTab("mangas")}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "mangas"
                ? "border-amber-400 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Mangas ({profile._count?.mangas || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "stats"
                ? "border-amber-400 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Niveau & Stats</span>
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "menu"
                ? "border-amber-400 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Avantages</span>
          </button>
        </div>

        {/* --- ONGLET 1 : GRILLE DES MANGAS (STYLE FEED TIKTOK) --- */}
        {activeTab === "mangas" && (
          <div className="w-full">
            {!profile.mangas || profile.mangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/40 my-2">
                <BookOpen className="w-10 h-10 text-zinc-700" />
                <p className="text-zinc-400 mt-3 text-sm font-medium">Aucun manga publié</p>
                <Link
                  href="/creator/upload"
                  className="mt-4 px-5 py-2 rounded-full bg-zinc-800 text-white text-xs font-bold hover:bg-zinc-700 transition-all border border-zinc-700"
                >
                  Publier ton premier projet
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                {profile.mangas.map((manga: any) => (
                  <Link
                    key={manga.id}
                    href={`/manga/${manga.id}`}
                    className="group relative aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:opacity-90 transition-all"
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

                    {/* OVERLAY INFÉRIEUR DES VUES/LIKES FAÇON TIKTOK */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
                      <span className="flex items-center gap-1 text-white text-[10px] font-bold drop-shadow">
                        <Eye className="w-3 h-3 text-white" /> {manga.viewsCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-white text-[10px] font-bold drop-shadow">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {manga.likesCount || 0}
                      </span>
                    </div>

                    {/* BOUTON SUPPRESSION DISCRET */}
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
                      className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
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

        {/* --- ONGLET 2 : NIVEAU & REVENUS --- */}
        {activeTab === "stats" && (
          <div className="w-full space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 text-center">
                <Zap className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                <p className="text-base font-black text-white">{profile.steamPoints || 0}</p>
                <p className="text-[10px] text-zinc-400 font-medium">Points Steam</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 text-center">
                <Award className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                <p className="text-base font-black text-white">Niv. {profile.steamLevel || 1}</p>
                <p className="text-[10px] text-zinc-400 font-medium">Niveau</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 text-center">
                <Coins className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                <p className="text-base font-black text-white">{profile.earnings?.total || 0}$</p>
                <p className="text-[10px] text-zinc-400 font-medium">Revenus</p>
              </div>
            </div>
          </div>
        )}

        {/* --- ONGLET 3 : AVANTAGES & LIENS ADMINISTRATIFS --- */}
        {activeTab === "menu" && (
          <div className="w-full space-y-2">
            <Link
              href="/certification"
              className="flex items-center justify-between p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-white">Demande de Certification</span>
                {profile.isCertified && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-bold border border-amber-400/20">
                    Certifié
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            {profile.isCertified && (
              <Link
                href="/profile/badge-color"
                className="flex items-center justify-between p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Couleur du Badge</span>
                  <div
                    className="w-4 h-4 rounded-full border border-zinc-700"
                    style={{ backgroundColor: profile.avatarColor || '#FFD700' }}
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </Link>
            )}

            {profile.role === 'ADMIN' && (
              <Link
                href="/admin/certify"
                className="flex items-center justify-between p-3.5 bg-purple-950/40 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Panneau d'administration</span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </Link>
            )}
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
