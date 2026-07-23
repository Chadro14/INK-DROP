"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  BookOpen, 
  Users, 
  Heart, 
  Settings, 
  LogOut,
  Star,
  Edit,
  Eye,
  Mail
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  isCertified: boolean;
  premiumActive: boolean;
  createdAt: string;
  _count: {
    mangas: number;
    followers: number;
    following: number;
  };
  mangas?: any[];
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      
      // 🔥 AFFICHAGE DU TOKEN DANS L'UI
      setDebugInfo(`Token: ${token ? token.substring(0, 20) + "..." : "AUCUN TOKEN"}`);

      if (!token) {
        setError("Vous n'êtes pas connecté");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 🔥 AFFICHAGE DU STATUT DE LA RÉPONSE
        setDebugInfo((prev) => `${prev}\nStatus: ${res.status}`);

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            setError("Session expirée, reconnectez-vous");
            setLoading(false);
            return;
          }
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setProfile(data);
        setDebugInfo((prev) => `${prev}\n✅ Profil chargé`);
      } catch (err: any) {
        setError(err.message);
        setDebugInfo((prev) => `${prev}\n❌ Erreur: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ============================================
  // AFFICHAGE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 🔥 AFFICHAGE DE L'ERREUR ET DU DEBUG
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
          <p className="text-red-600 font-semibold text-center">❌ {error || "Profil non trouvé"}</p>
          <p className="text-gray-500 text-xs text-center mt-2 whitespace-pre-wrap">{debugInfo}</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 rounded-lg bg-black text-white font-semibold"
        >
          Se connecter
        </button>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-6 py-2 rounded-lg bg-gray-200 text-black font-semibold"
        >
          🔄 Recharger
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-lg font-bold text-black">Profil</span>
          <div className="flex items-center gap-3">
            <button className="text-gray-500 hover:text-black transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* AVATAR */}
      <section className="px-4 py-6 text-center border-b border-gray-200">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-black mx-auto border-2 border-black">
            {profile.username?.charAt(0).toUpperCase() || "?"}
          </div>
          {profile.isCertified && (
            <span className="absolute -top-1 -right-1">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </span>
          )}
          {profile.premiumActive && (
            <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              PREMIUM
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-black mt-3">{profile.username}</h1>
        <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
          <Mail className="w-3 h-3" />
          {profile.email}
        </p>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-black font-bold">{profile._count?.mangas || 0}</span>
            <span className="text-gray-500 ml-1">mangas</span>
          </div>
          <div>
            <span className="text-black font-bold">{profile._count?.followers || 0}</span>
            <span className="text-gray-500 ml-1">abonnés</span>
          </div>
          <div>
            <span className="text-black font-bold">{profile._count?.following || 0}</span>
            <span className="text-gray-500 ml-1">abonnements</span>
          </div>
        </div>

        <button className="mt-4 px-4 py-2 rounded-lg bg-gray-100 text-black text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto">
          <Edit className="w-4 h-4" />
          Modifier le profil
        </button>
      </section>

      {/* MANGAS */}
      <section className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-black" />
            Mangas publiés
          </h2>
          <Link href="/creator/upload" className="text-black text-xs font-medium hover:underline">
            + Ajouter
          </Link>
        </div>

        {!profile.mangas || profile.mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 mt-4 text-sm">Aucun manga publié</p>
            <Link
              href="/creator/upload"
              className="mt-4 px-6 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Publier mon premier manga
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {profile.mangas.map((manga: any) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-black transition-all active:scale-[0.97]"
              >
                <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center relative">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-semibold truncate text-black">{manga.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5 text-gray-500 text-[10px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-black" /> {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3 text-black" /> {manga.viewsCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}