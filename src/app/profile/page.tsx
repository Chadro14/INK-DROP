"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  BadgeCheck, 
  Settings, 
  LogOut, 
  Edit, 
  Share2, 
  BookOpen, 
  Heart, 
  Shield 
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
          throw new Error("Erreur de chargement");
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
        text: `Decouvre le profil de ${username} sur INKDROP`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copie dans le presse-papier");
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
        <p className="text-gray-500 text-center">{error || "Profil introuvable"}</p>
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
      {/* HEADER TIKTOK STYLE */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-lg font-bold">@{profile.username}</span>
          <div className="flex items-center gap-4">
            <Link href="/profile/settings" className="text-gray-700 hover:text-black">
              <Settings className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6">
        
        {/* AVATAR + PSEUDO */}
        <div className="flex flex-col items-center text-center">
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

          <div className="flex items-center gap-1 mb-1">
            <h1 className="text-xl font-bold">@{profile.username}</h1>
            {profile.isCertified && (
              <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500 stroke-white shrink-0" />
            )}
          </div>

          <p className="text-xs text-gray-400 mb-4">{profile.email}</p>

          {/* STATS ROW (TIKTOK STYLE: Suivis | Abonnés | Mangas) */}
          <div className="flex items-center justify-center gap-6 my-2 w-full">
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
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 my-4">
            <Link
              href="/profile/edit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-md font-semibold text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier le profil
            </Link>
            <button
              onClick={handleShare}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-md text-black transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* BIO */}
          {profile.bio && (
            <p className="text-sm text-gray-600 max-w-xs text-center mb-6">
              {profile.bio}
            </p>
          )}
        </div>

        {/* NAVIGATION / SECTIONS SIMPLE */}
        <div className="border-t border-gray-100 pt-4 space-y-1">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <Shield className="w-5 h-5 text-gray-500" />
            <span>Tableau de bord</span>
          </Link>

          <Link 
            href="/library" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <BookOpen className="w-5 h-5 text-gray-500" />
            <span>Ma bibliotheque</span>
          </Link>

          <Link 
            href="/favorites" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <Heart className="w-5 h-5 text-gray-500" />
            <span>Mes favoris</span>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
