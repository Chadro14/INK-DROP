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
    <div className="flex flex-col min-h-screen pb-20 bg-white text-black">

      {/* HEADER TIKTOK */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="w-10"></div>
          <span className="text-lg font-bold truncate">@{profile.username}</span>
          <div className="flex items-center gap-3">
            <Link href="/profile/settings" className="text-gray-700 hover:text-black transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="text-gray-700 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* SECTION CENTRÉE STYLE TIKTOK */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6">
        
        {/* AVATAR + INFOS DE BASE */}
        <div className="flex flex-col items-center text-center">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md mb-3 overflow-hidden border-2 border-black"
            style={{ backgroundColor: profile.avatarColor || "#000000" }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              profile.username?.charAt(0).toUpperCase() || "?"
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="text-xl font-bold">@{profile.username}</h1>
            {profile.isCertified && (
              <BadgeCheck
                className="w-5 h-5 shrink-0"
                fill={profile.avatarColor || "#FFD700"}
                color="white"
                strokeWidth={1.5}
              />
            )}
            {profile.premiumActive && (
              <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                PRO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{profile.email}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>

          {/* BIO */}
          <p className="text-sm text-gray-600 max-w-xs text-center my-2">
            {profile.bio || "Aucune bio"}
          </p>

          {/* STATS EN LIGNE (STYLE TIKTOK) */}
          <div className="flex items-center justify-center gap-6 my-4 w-full py-2 border-y border-gray-100">
            <div className="text-center">
              <span className="block font-bold text-lg">{profile._count?.following || 0}</span>
              <span className="text-xs text-gray-500">Abonnements</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="text-center">
              <span className="block font-bold text-lg">{profile._count?.followers || 0}</span>
              <span className="text-xs text-gray-500">Abonnes</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="text-center">
              <span className="block font-bold text-lg">{profile._count?.mangas || 0}</span>
              <span className="text-xs text-gray-500">Mangas</span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="text-center">
              <span className="block font-bold text-lg text-yellow-600">{profile.manas || 0}</span>
              <span className="text-xs text-gray-500">MANAS</span>
            </div>
          </div>

          {/* BOUTONS D'ACTION */}
          <div className="flex items-center gap-3 w-full max-w-xs mb-6">
            <Link
              href="/profile/edit"
              className="flex-1 py-2.5 rounded-md bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-md bg-gray-100 text-black text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </div>

        {/* CARTES STEAM & REVENUS */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <Zap className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-sm font-bold text-black">{profile.steamPoints || 0}</p>
            <p className="text-[10px] text-gray-500">Points Steam</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <Award className="w-4 h-4 mx-auto text-purple-500 mb-1" />
            <p className="text-sm font-bold text-black">Niv. {profile.steamLevel || 1}</p>
            <p className="text-[10px] text-gray-500">Niveau</p>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <Coins className="w-4 h-4 mx-auto text-green-500 mb-1" />
            <p className="text-sm font-bold text-black">{profile.earnings?.total || 0}$</p>
            <p className="text-[10px] text-gray-500">Revenus</p>
          </div>
        </div>

        {/* MENUS D'ACCÈS RAPIDE */}
        <div className="space-y-2 mb-6">
          <Link
            href="/certification"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-black transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Certification</span>
              {profile.isCertified && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-semibold">
                  Certifie
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          {profile.isCertified && (
            <Link
              href="/profile/badge-color"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-black transition-colors"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Couleur du badge</span>
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
              className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200 hover:border-black transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Admin - Certification</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          )}
        </div>

        {/* SECTION MANGAS PUBLIÉS */}
        <section className="pt-2">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-black" />
              <h2 className="text-sm font-semibold">Mangas publies</h2>
            </div>
            <Link
              href="/creator/upload"
              className="flex items-center gap-1 text-xs font-semibold text-black hover:underline"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </Link>
          </div>

          {!profile.mangas || profile.mangas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <BookOpen className="w-10 h-10 text-gray-300" />
              <p className="text-gray-500 mt-2 text-sm">Aucun manga publie</p>
              <Link
                href="/creator/upload"
                className="mt-3 px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                Publier un manga
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {profile.mangas.map((manga: any) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group relative aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
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

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs font-medium truncate">{manga.title}</p>
                    <div className="flex items-center gap-2 text-white/70 text-[10px]">
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
                    className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-red-600/80 text-white shadow hover:bg-red-600 transition-colors"
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
