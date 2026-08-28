"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  User,
  Mail,
  Calendar,
  Users,
  Crown,
  BadgeCheck,
  BookOpen,
  Heart,
  Eye,
  ArrowLeft,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type PublicUser = {
  id: string;
  username: string;
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
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = params.userId as string;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${userId}`);
        if (!res.ok) {
          throw new Error("Utilisateur non trouvé");
        }
        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <Loader message="Chargement du profil" />;
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white px-4">
        <p className="text-zinc-400 text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all"
        >
          Retourner à l'accueil
        </button>
      </div>
    );
  }

  const badgeColor = "#3B82F6";

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour</span>
          </button>
          <span className="text-sm font-bold text-white/90">Profil</span>
          <div className="w-16" />
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-32 md:h-48 w-full bg-gradient-to-r from-zinc-950 via-blue-950/40 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-14 md:-mt-20 flex flex-col items-center">

        {/* AVATAR */}
        <div className="relative mb-3">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-900 overflow-hidden border-4 border-zinc-950 shadow-2xl ring-2 ring-blue-500/30">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-bold text-blue-400 bg-gradient-to-br from-zinc-800 to-zinc-900">
                {user.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          {user.isCertified && (
            <div className="absolute bottom-1 right-1 bg-zinc-950 p-0.5 rounded-full shadow-lg">
              <BadgeCheck className="w-6 h-6 md:w-7 md:h-7" fill={badgeColor} color="black" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* NOM & BADGES */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl md:text-3xl font-bold text-white">@{user.username}</h1>
          {user.premiumActive && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" />
              Premium
            </span>
          )}
        </div>

        {/* BIO */}
        <p className="text-zinc-400 text-sm md:text-base text-center mb-3 max-w-md">
          {user.bio || "Membre INKDROP"}
        </p>

        {/* STATS SOCIALES */}
        <div className="flex items-center justify-center gap-6 md:gap-12 py-3.5 px-6 md:px-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 w-full max-w-md md:max-w-lg mb-6">
          <div className="text-center">
            <p className="text-lg md:text-xl font-bold text-white">{user._count?.following || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Abonnements</p>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-bold text-white">{user._count?.followers || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Abonnés</p>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-bold text-white">{user._count?.mangas || 0}</p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Mangas</p>
          </div>
        </div>

        {/* INFOS */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-500 mb-6">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            {user.isCertified ? "Créateur certifié" : "Membre"}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Membre depuis {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* BOUTON SUIVRE */}
        <button
          className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          Suivre
        </button>

      </main>

      <BottomNav />
    </div>
  );
}
