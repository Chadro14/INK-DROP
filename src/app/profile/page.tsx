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
  Palette 
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
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white px-4">
        <p className="text-zinc-400 text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-black text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <span className="text-xl font-bold text-white">Profil</span>
          <div className="flex items-center gap-4 text-zinc-400">
            <button onClick={handleShare} className="hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <Link href="/profile/settings" className="hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* AVATAR & INFOS PUBLIQUES */}
      <section className="px-4 py-6 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center text-center">
          
          {/* Avatar bien recadré */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-2 border-zinc-700 shadow-xl shrink-0">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.username?.charAt(0).toUpperCase() || "?"
              )}
            </div>
          </div>

          {/* Nom & Badges */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white truncate max-w-[220px]">{profile.username}</h1>
            {profile.isCertified && (
              <BadgeCheck
                className="w-5 h-5 flex-shrink-0"
                fill={profile.avatarColor || "#FFD700"}
                color="black"
                strokeWidth={1.5}
              />
            )}
            {profile.premiumActive && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-bold">
                PRO
              </span>
            )}
          </div>

          {/* Bio */}
          <p className="text-zinc-400 text-sm mb-3 max-w-xs">{profile.bio || "Aucune bio"}</p>

          {/* Email & Date d'inscription */}
          <div className="flex flex-col items-center gap-1.5 text-xs text-zinc-400 mb-5 bg-zinc-900/80 px-4 py-2.5 rounded-xl border border-zinc-800 w-full max-w-xs">
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 w-full">
            <Link
              href="/profile/edit"
              className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>

        </div>
      </section>

      {/* STATISTIQUES & MANAS */}
      <section className="px-4 py-2 max-w-md mx-auto w-full">
        <div className="grid grid-cols-4 gap-2 bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
          <div>
            <p className="text-base font-bold text-white">{profile._count?.mangas || 0}</p>
            <p className="text-[11px] text-zinc-400">Mangas</p>
          </div>
          <div>
            <p className="text-base font-bold text-white">{profile._count?.followers || 0}</p>
            <p className="text-[11px] text-zinc-400">Abonnés</p>
          </div>
          <div>
            <p className="text-base font-bold text-white">{profile._count?.following || 0}</p>
            <p className="text-[11px] text-zinc-400">Abonnements</p>
          </div>
          <div>
            <p className="text-base font-bold text-amber-400">{profile.manas || 0}</p>
            <p className="text-[11px] text-zinc-400">MANAS</p>
          </div>
        </div>
      </section>

      {/* STEAM & REVENUS */}
      <section className="px-4 py-2 max-w-md mx-auto w-full">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5">
            <Zap className="w-4 h-4 mx-auto text-amber-400 mb-1" />
            <p className="text-sm font-bold text-white">{profile.steamPoints || 0}</p>
            <p className="text-[10px] text-zinc-400">Points Steam</p>
          </div>
          <div className="text-center bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5">
            <Award className="w-4 h-4 mx-auto text-purple-400 mb-1" />
            <p className="text-sm font-bold text-white">Niv. {profile.steamLevel || 1}</p>
            <p className="text-[10px] text-zinc-400">Niveau</p>
          </div>
          <div className="text-center bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5">
            <Coins className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
            <p className="text-sm font-bold text-white">{profile.earnings?.total || 0}$</p>
            <p className="text-[10px] text-zinc-400">Revenus</p>
          </div>
        </div>
      </section>

      {/* LIENS DE NAVIGATION (CERTIFICATION, COULEUR, ADMIN) */}
      <section className="px-4 py-2 max-w-md mx-auto w-full space-y-2">
        <Link
          href="/certification"
          className="flex items-center justify-between py-3 px-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-medium text-white">Certification</span>
            {profile.isCertified && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-semibold border border-amber-400/20">
                ✅ Certifié
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </Link>

        {profile.isCertified && (
          <Link
            href="/profile/badge-color"
            className="flex items-center justify-between py-3 px-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-medium text-white">Couleur du badge</span>
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
            className="flex items-center justify-between py-3 px-4 bg-zinc-900/90 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-white">Admin - Certification</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </Link>
        )}
      </section>

      {/* MANGAS PUBLIÉS */}
      <section className="px-4 py-4 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Mangas publiés</h2>
          </div>
          <Link
            href="/creator/upload"
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Link>
        </div>

        {!profile.mangas || profile.mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
            <BookOpen className="w-10 h-10 text-zinc-600" />
            <p className="text-zinc-400 mt-3 text-sm">Aucun manga publié</p>
            <Link
              href="/creator/upload"
              className="mt-3 px-5 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
            >
              Publier mon premier manga
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {profile.mangas.map((manga: any) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group relative aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/80 hover:scale-[1.02] transition-transform duration-200"
              >
                {manga.coverUrl || manga.imageUrl ? (
                  <img 
                    src={manga.coverUrl || manga.imageUrl} 
                    alt={manga.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/70 to-transparent">
                  <p className="text-white text-xs font-medium truncate">{manga.title}</p>
                  <div className="flex items-center gap-2 text-zinc-300 text-[10px] mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-rose-500" /> {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3 text-sky-400" /> {manga.viewsCount || 0}
                    </span>
                  </div>
                </div>

                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm(`Supprimer "${manga.title}" définitivement ?`)) {
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
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-red-600/90 text-white shadow-md hover:bg-red-600 transition-all backdrop-blur-sm"
                  title="Supprimer le manga"
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
      </section>

      <BottomNav />
    </div>
  );
}
