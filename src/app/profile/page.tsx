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
  Shield,
  Palette,
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
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
        <p className="text-gray-500 text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const badgeColorValue = profile.avatarColor || "#FFD700";
  const isHexColor = badgeColorValue.startsWith("#");

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-white text-black selection:bg-black selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-xl font-black tracking-tight">Profil</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
              title="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <Link 
              href="/profile/settings" 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
              title="Paramètres"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* AVATAR & INFOS PUBLIQUES */}
      <section className="px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-3xl font-black text-black overflow-hidden shadow-inner border border-gray-200">
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight truncate">{profile.username}</h1>
              
              {/* BADGE CERTIFIÉ SVG CORRIGÉ */}
              {profile.isCertified && (
                <svg
                  className="w-5 h-5 flex-shrink-0 drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill={isHexColor ? badgeColorValue : "currentColor"}
                  stroke="white"
                  strokeWidth="1.5"
                >
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}

              {/* BADGE PREMIUM ANIMÉ & INCITATEUR */}
              {!profile.premiumActive ? (
                <Link
                  href="/premium"
                  className="relative group inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] text-black text-[11px] font-black tracking-wider uppercase shadow-md animate-gradient hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin duration-3000" />
                  <span>PRO VIP</span>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </Link>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-black tracking-wider shadow-sm">
                  PRO
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm mt-0.5 line-clamp-2">{profile.bio || "Aucune bio pour le moment."}</p>
            
            <div className="flex items-center gap-3 text-gray-400 text-xs mt-2">
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{profile.email}</span>
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Boutons d'action rapides */}
        <div className="flex gap-2.5 mt-4">
          <Link
            href="/profile/edit"
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Edit className="w-4 h-4" />
            Modifier le profil
          </Link>
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl bg-gray-100 text-black text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>
      </section>

      {/* STATS & MANAS */}
      <section className="px-4 py-3 border-t border-b border-gray-100 bg-gray-50/50">
        <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto text-center">
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
            <p className="text-base font-black tracking-tight">{profile._count?.mangas || 0}</p>
            <p className="text-[11px] text-gray-500 font-medium">Mangas</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
            <p className="text-base font-black tracking-tight">{profile._count?.followers || 0}</p>
            <p className="text-[11px] text-gray-500 font-medium">Abonnés</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
            <p className="text-base font-black tracking-tight">{profile._count?.following || 0}</p>
            <p className="text-[11px] text-gray-500 font-medium">Abonnements</p>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
            <p className="text-base font-black tracking-tight text-amber-600">{profile.manas || 0}</p>
            <p className="text-[11px] text-gray-500 font-medium">MANAS</p>
          </div>
        </div>
      </section>

      {/* STEAM & REVENUS */}
      <section className="px-4 py-3 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-2.5 max-w-lg mx-auto">
          <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">{profile.steamPoints || 0}</p>
              <p className="text-[10px] text-gray-500">Points Steam</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Niv. {profile.steamLevel || 1}</p>
              <p className="text-[10px] text-gray-500">Niveau</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">{profile.earnings?.total || 0}$</p>
              <p className="text-[10px] text-gray-500">Revenus</p>
            </div>
          </div>
        </div>
      </section>

      {/* LIENS DE NAVIGATION DU PROFIL */}
      <section className="px-4 py-3 space-y-2 max-w-lg mx-auto w-full">
        <Link
          href="/certification"
          className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-gray-100 shadow-2xs hover:border-black transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block">Certification</span>
              <span className="text-[10px] text-gray-500">Obtenir le badge vérifié</span>
            </div>
            {profile.isCertified && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                Certifié
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {profile.isCertified && (
          <Link
            href="/profile/badge-color"
            className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-gray-100 shadow-2xs hover:border-black transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">Couleur du badge</span>
                <span className="text-[10px] text-gray-500">Personnaliser votre visuel</span>
              </div>
              <div
                className="w-4 h-4 rounded-full border border-gray-200 ml-2 shadow-inner"
                style={{ backgroundColor: isHexColor ? badgeColorValue : '#FFD700' }}
              />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {profile.role === 'ADMIN' && (
          <Link
            href="/admin/certify"
            className="flex items-center justify-between py-3 px-4 bg-gray-900 text-white rounded-xl shadow-md hover:bg-black transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">Admin - Certification</span>
                <span className="text-[10px] text-gray-400">Panneau de modération</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </section>

      {/* MANGAS PUBLIÉS */}
      <section className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-black" />
            <h2 className="text-xs font-black tracking-wider uppercase text-gray-500">Mangas publiés</h2>
          </div>
          <Link
            href="/creator/upload"
            className="flex items-center gap-1 text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </Link>
        </div>

        {!profile.mangas || profile.mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
            <BookOpen className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 mt-2 text-xs font-medium">Aucun manga publié pour l'instant</p>
            <Link
              href="/creator/upload"
              className="mt-3 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Publier mon premier manga
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {profile.mangas.map((manga: any) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group relative aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
              >
                {manga.coverUrl || manga.imageUrl ? (
                  <img 
                    src={manga.coverUrl || manga.imageUrl} 
                    alt={manga.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <BookOpen className="w-6 h-6 text-gray-300" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-[11px] font-bold truncate leading-tight">{manga.title}</p>
                  <div className="flex items-center gap-2 text-white/80 text-[9px] mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5" /> {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-2.5 h-2.5" /> {manga.viewsCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <BookOpen className="w-2.5 h-2.5" /> {manga._count?.chapters || 0}
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
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-red-600/90 text-white shadow-md hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100"
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
