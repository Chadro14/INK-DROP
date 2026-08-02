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
        text: `Decouvre le profil de ${username} sur INKDROP !`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copie dans le presse-papier !");
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
        <p className="text-gray-500 text-center">{error || "Profil non trouve"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-white text-black">

      {/* HEADER EN HAUT */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-3.5">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="text-lg font-bold truncate">@{profile.username}</span>
          <div className="flex items-center gap-4">
            <Link href="/profile/settings" className="text-gray-700 hover:text-black transition-colors" title="Parametres">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="text-gray-700 hover:text-red-500 transition-colors" title="Deconnexion">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL RESPONSIVE */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 pt-6 md:pt-10 space-y-8">
        
        {/* EN-TÊTE DU PROFIL (STYLE TIKTOK ADAPTÉ PC) */}
        <div className="flex flex-col items-center text-center">
          
          {/* AVATAR */}
          <div 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-3xl md:text-5xl font-bold text-white shadow-md mb-4 overflow-hidden border-2 border-black shrink-0"
            style={{ backgroundColor: profile.avatarColor || "#000000" }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              profile.username?.charAt(0).toUpperCase() || "?"
            )}
          </div>

          {/* NOM ET BADGES */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap justify-center">
            <h1 className="text-xl md:text-2xl font-bold">@{profile.username}</h1>
            {profile.isCertified && (
              <BadgeCheck
                className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                fill={profile.avatarColor || "#FFD700"}
                color="white"
                strokeWidth={1.5}
              />
            )}
            {profile.premiumActive && (
              <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] md:text-xs font-bold">
                PRO
              </span>
            )}
          </div>

          {/* DÉTAILS COMPTE */}
          <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-gray-500 mb-3 flex-wrap">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{profile.email}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>

          {/* BIO */}
          <p className="text-sm md:text-base text-gray-600 max-w-md text-center my-1 leading-relaxed">
            {profile.bio || "Aucune bio renseignee"}
          </p>

          {/* STATISTIQUES LARGES (SUIVIS | ABONNÉS | MANGAS | MANAS) */}
          <div className="flex items-center justify-center gap-6 md:gap-12 my-6 w-full max-w-lg py-3 border-y border-gray-100">
            <div className="text-center">
              <span className="block font-bold text-lg md:text-xl">{profile._count?.following || 0}</span>
              <span className="text-xs md:text-sm text-gray-500">Abonnements</span>
            </div>
            <div className="h-6 w-[1px] bg-gray-200" />
            <div className="text-center">
              <span className="block font-bold text-lg md:text-xl">{profile._count?.followers || 0}</span>
              <span className="text-xs md:text-sm text-gray-500">Abonnes</span>
            </div>
            <div className="h-6 w-[1px] bg-gray-200" />
            <div className="text-center">
              <span className="block font-bold text-lg md:text-xl">{profile._count?.mangas || 0}</span>
              <span className="text-xs md:text-sm text-gray-500">Mangas</span>
            </div>
            <div className="h-6 w-[1px] bg-gray-200" />
            <div className="text-center">
              <span className="block font-bold text-lg md:text-xl text-yellow-600">{profile.manas || 0}</span>
              <span className="text-xs md:text-sm text-gray-500">MANAS</span>
            </div>
          </div>

          {/* BOUTONS D'ACTION */}
          <div className="flex items-center gap-3 w-full max-w-sm">
            <Link
              href="/profile/edit"
              className="flex-1 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
            <button
              onClick={handleShare}
              className="px-5 py-2.5 rounded-lg bg-gray-100 text-black text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </div>

        {/* SECTION METRIQUES (POINTS STEAM & REVENUS) */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
          <div className="text-center bg-gray-50 hover:bg-gray-100/80 transition-colors rounded-xl p-3 md:p-4 border border-gray-100">
            <Zap className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-base md:text-lg font-bold text-black">{profile.steamPoints || 0}</p>
            <p className="text-xs text-gray-500">Points Steam</p>
          </div>
          <div className="text-center bg-gray-50 hover:bg-gray-100/80 transition-colors rounded-xl p-3 md:p-4 border border-gray-100">
            <Award className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <p className="text-base md:text-lg font-bold text-black">Niv. {profile.steamLevel || 1}</p>
            <p className="text-xs text-gray-500">Niveau</p>
          </div>
          <div className="text-center bg-gray-50 hover:bg-gray-100/80 transition-colors rounded-xl p-3 md:p-4 border border-gray-100">
            <Coins className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <p className="text-base md:text-lg font-bold text-black">{profile.earnings?.total || 0}$</p>
            <p className="text-xs text-gray-500">Revenus</p>
          </div>
        </div>

        {/* RACCOURCIS DE GESTION */}
        <div className="space-y-2.5 max-w-2xl mx-auto">
          <Link
            href="/certification"
            className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-black transition-all"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-gray-600" />
              <span className="text-sm md:text-base font-medium">Certification</span>
              {profile.isCertified && (
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] md:text-xs font-semibold">
                  Certifie
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          {profile.isCertified && (
            <Link
              href="/profile/badge-color"
              className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-black transition-all"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-gray-600" />
                <span className="text-sm md:text-base font-medium">Couleur du badge</span>
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: profile.avatarColor || '#FFD700' }}
                />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          )}

          {profile.role === 'ADMIN' && (
            <Link
              href="/admin/certify"
              className="flex items-center justify-between p-3.5 bg-gray-100 rounded-xl border border-gray-200 hover:border-black transition-all"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm md:text-base font-medium">Admin - Certification</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          )}
        </div>

        {/* GRILLE DE MANGAS PUBLIÉS (RESPONSIVE: 3 colonnes sur Mobile, 4 à 5 sur PC) */}
        <section className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-black" />
              <h2 className="text-base md:text-lg font-bold">Mangas publies</h2>
            </div>
            <Link
              href="/creator/upload"
              className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-black hover:underline"
            >
              <Plus className="w-4 h-4" />
              Ajouter un manga
            </Link>
          </div>

          {!profile.mangas || profile.mangas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm md:text-base">Aucun manga publie pour le moment</p>
              <Link
                href="/creator/upload"
                className="mt-4 px-5 py-2.5 rounded-lg bg-black text-white text-xs md:text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Publier un manga
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
              {profile.mangas.map((manga: any) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group relative aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                >
                  {manga.coverUrl || manga.imageUrl ? (
                    <img 
                      src={manga.coverUrl || manga.imageUrl} 
                      alt={manga.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="text-white text-xs md:text-sm font-semibold truncate">{manga.title}</p>
                    <div className="flex items-center gap-2.5 text-white/80 text-[10px] md:text-xs mt-0.5">
                      <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {manga.likesCount || 0}</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {manga.viewsCount || 0}</span>
                    </div>
                  </div>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm(`Supprimer "${manga.title}" definitivement ?`)) {
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
                          alert("Erreur reseau");
                        }
                      }
                    }}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-red-600/80 text-white shadow hover:bg-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
