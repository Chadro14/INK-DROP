"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CertificationBadge } from "@/components/badges/certification-badge";
import { PremiumBadge } from "@/components/badges/premium-badge";
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

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-gray-50">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-xl font-bold text-black">Profil</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="text-gray-600 hover:text-black transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <Link href="/profile/settings" className="text-gray-600 hover:text-black transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-lg mx-auto w-full">
        
        {/* AVATAR & INFOS PUBLIQUES */}
        <section className="bg-white px-4 py-8 mb-2 rounded-b-3xl shadow-sm">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div 
              className="relative w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-md mb-4 overflow-hidden"
              style={{ backgroundColor: profile.avatarColor || "#000000" }}
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                profile.username.charAt(0).toUpperCase()
              )}
            </div>

            {/* Username & Badges */}
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-black">{profile.username}</h1>
              <CertificationBadge isCertified={profile.isCertified} color={profile.avatarColor || "#3b82f6"} />
              {profile.premiumActive && <PremiumBadge />}
            </div>

            {/* Email & Bio */}
            <p className="text-gray-500 text-sm mb-4">{profile.email}</p>
            {profile.bio && (
              <p className="text-gray-700 text-center text-sm px-4 mb-4">{profile.bio}</p>
            )}

            {/* Edit Profile Button */}
            <Link 
              href="/profile/edit"
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full font-medium transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              Modifier le profil
            </Link>
          </div>

          {/* STATS */}
          <div className="flex justify-center gap-8 mt-8 border-t border-gray-100 pt-6">
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl text-black">{profile._count?.mangas || 0}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Mangas</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl text-black">{profile._count?.followers || 0}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Abonnés</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl text-black">{profile._count?.following || 0}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Suivis</span>
            </div>
          </div>
        </section>

        {/* PORTEFEUILLE & NIVEAU */}
        <section className="px-4 py-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Manas disponibles</p>
                <p className="font-bold text-lg">{profile.manas}</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Niveau Steam ({profile.steamPoints} pts)</p>
                <p className="font-bold text-lg">Lvl {profile.steamLevel}</p>
              </div>
            </div>
            <Award className="w-6 h-6 text-purple-500" />
          </div>
        </section>

        {/* MENU ACTIONS */}
        <section className="px-4 py-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Link href="/dashboard" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
              <div className="flex items-center gap-3 text-black">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Tableau de bord créateur</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
            <Link href="/library" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
              <div className="flex items-center gap-3 text-black">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Ma bibliothèque</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
            <Link href="/favorites" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
              <div className="flex items-center gap-3 text-black">
                <Heart className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Mes favoris</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
            <Link href="/theme" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 text-black">
                <Palette className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Apparence</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
          </div>
        </section>
        
      </main>

      {/* BOTTOM NAV */}
      <BottomNav />
    </div>
  );
}
