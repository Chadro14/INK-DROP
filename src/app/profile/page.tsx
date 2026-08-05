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

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="text-xl font-bold text-white">Profil</span>
          <div className="flex items-center gap-4 text-zinc-400">
            <button onClick={handleShare} className="hover:text-white transition-colors" title="Partager">
              <Share2 className="w-5 h-5" />
            </button>
            <Link href="/profile/settings" className="hover:text-white transition-colors" title="Paramètres">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="hover:text-red-400 transition-colors" title="Déconnexion">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">

        {/* 1. CARTE PRINCIPALE PROFIL */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            
            {/* Avatar bien cadré */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-2 border-zinc-700 shadow-lg">
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

            {/* Détails Utilisateur */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h1 className="text-2xl font-bold text-white truncate">{profile.username}</h1>
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
                  <p className="text-zinc-400 text-sm mt-1">{profile.bio || "Aucune bio"}</p>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2 justify-center md:justify-end shrink-0 mt-2 md:mt-0">
                  <Link
                    href="/profile/edit"
                    className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Link>
                  <button
                    onClick={handleShare}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-semibold border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infos secondaires (Email & Date) */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-zinc-400 mt-4 pt-4 border-t border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. STATISTIQUES, STEAM & REVENUS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl text-center">
            <p className="text-xl font-bold text-white">{profile._count?.mangas || 0}</p>
            <p className="text-xs text-zinc-400">Mangas</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl text-center">
            <p className="text-xl font-bold text-white">{profile._count?.followers || 0}</p>
            <p className="text-xs text-zinc-400">Abonnés</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl text-center">
            <p className="text-xl font-bold text-white">{profile._count?.following || 0}</p>
            <p className="text-xs text-zinc-400">Abonnements</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl text-center">
            <p className="text-xl font-bold text-amber-400">{profile.manas || 0}</p>
            <p className="text-xs text-zinc-400">MANAS</p>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 text-center flex flex-col items-center justify-center">
            <Zap className="w-5 h-5 text-amber-400 mb-1" />
            <p className="text-base font-bold text-white">{profile.steamPoints || 0}</p>
            <p className="text-[11px] text-zinc-400">Points Steam</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 text-center flex flex-col items-center justify-center">
            <Award className="w-5 h-5 text-purple-400 mb-1" />
            <p className="text-base font-bold text-white">Niv. {profile.steamLevel || 1}</p>
            <p className="text-[11px] text-zinc-400">Niveau</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 text-center flex flex-col items-center justify-center">
            <Coins className="w-5 h-5 text-emerald-400 mb-1" />
            <p className="text-base font-bold text-white">{profile.earnings?.total || 0}$</p>
            <p className="text-[11px] text-zinc-400">Revenus</p>
          </div>
        </section>

        {/* 3. RACCOURCIS ET CERTIFICATION (Grille sur PC) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/certification"
            className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors"
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
              className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors"
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
              className="flex items-center justify-between p-4 bg-zinc-900/90 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-colors md:col-span-2"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-white">Admin - Espace Certification</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>
          )}
        </section>

        {/* 4. MANGAS PUBLIÉS (Aéré en grille responsive) */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white" />
              <h2 className="text-base font-semibold text-white">Mangas publiés</h2>
            </div>
            <Link
              href="/creator/upload"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </Link>
          </div>

          {!profile.mangas || profile.mangas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="w-12 h-12 text-zinc-700" />
              <p className="text-zinc-400 mt-3 text-sm">Aucun manga publié pour le moment</p>
              <Link
                href="/creator/upload"
                className="mt-4 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
              >
                Publier mon premier manga
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {profile.mangas.map((manga: any) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group relative aspect-[2/3] bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700/60 hover:scale-[1.03] transition-transform duration-200"
                >
                  {manga.coverUrl || manga.imageUrl ? (
                    <img 
                      src={manga.coverUrl || manga.imageUrl} 
                      alt={manga.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <p className="text-white text-xs font-semibold truncate">{manga.title}</p>
                    <div className="flex items-center gap-2 text-zinc-300 text-[10px] mt-1">
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

      </main>

      <BottomNav />
    </div>
  );
}
