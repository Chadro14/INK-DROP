"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  BadgeCheck,
  BookOpen, 
  Heart, 
  Settings, 
  LogOut,
  Edit,
  Share2,
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
  avatarColor: string | null;
  badgeColor: string | null;
  _count: {
    mangas: number;
    followers: number;
    following: number;
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
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Erreur lors du chargement du profil");
        }

        const profileData = await res.json();
        setProfile(profileData);
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
    <div className="flex flex-col min-h-screen pb-20 bg-white">
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
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* AVATAR & PSEUDO */}
        <div className="flex flex-col items-center text-center mb-6">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-md mb-3 overflow-hidden"
            style={{ backgroundColor: profile.avatarColor || "#000000" }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              profile.username.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h1 className="text-2xl font-bold text-black">{profile.username}</h1>
            {profile.isCertified && (
              <BadgeCheck 
                className="w-5 h-5 shrink-0" 
                fill={profile.badgeColor || profile.avatarColor || "#3b82f6"} 
                color="white" 
              />
            )}
          </div>

          <p className="text-gray-500 text-sm mb-3">{profile.email}</p>
          {profile.bio && <p className="text-gray-700 text-sm mb-4">{profile.bio}</p>}

          <Link 
            href="/profile/edit"
            className="flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full font-medium transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Modifier le profil
          </Link>
        </div>

        {/* STATS */}
        <div className="flex justify-around py-4 border-y border-gray-100 mb-6">
          <div className="text-center">
            <span className="block font-bold text-xl text-black">{profile._count?.mangas || 0}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Mangas</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-xl text-black">{profile._count?.followers || 0}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Abonnés</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-xl text-black">{profile._count?.following || 0}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Abonnements</span>
          </div>
        </div>

        {/* MENU */}
        <div className="space-y-2">
          <Link href="/dashboard" className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-black">Tableau de bord</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link href="/profile/badge-color" className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-black">Couleur du badge</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link href="/library" className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-black">Ma bibliothèque</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link href="/favorites" className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-black">Favoris</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
