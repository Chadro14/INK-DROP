"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Coins, 
  Eye,
  Heart,
  Crown,
  FileText,
  TrendingUp,
  AlertCircle,
  Plus,
  DollarSign,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type CreatorStats = {
  mangas: number;
  followers: number;
  views: number;
  likes: number;
  chapters: number;
  earnings: number;
};

export default function CreatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // ✅ Récupérer l'utilisateur ET les stats en une seule requête
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Erreur de chargement du profil");
        }

        const userData = await res.json();
        setUser(userData);

        if (userData.role !== "CREATOR" && userData.role !== "ADMIN") {
          setError("Vous n'êtes pas un créateur");
          setLoading(false);
          return;
        }

        // ✅ Utiliser les données de l'utilisateur pour les stats
        const mangasCount = userData._count?.mangas || 0;
        const followersCount = userData._count?.followers || 0;
        const totalViews = userData.mangas?.reduce((acc: number, m: any) => acc + (m.viewsCount || 0), 0) || 0;
        const totalLikes = userData.mangas?.reduce((acc: number, m: any) => acc + (m.likesCount || 0), 0) || 0;
        const totalChapters = userData.mangas?.reduce((acc: number, m: any) => acc + (m._count?.chapters || 0), 0) || 0;

        setStats({
          mangas: mangasCount,
          followers: followersCount,
          views: totalViews,
          likes: totalLikes,
          chapters: totalChapters,
          earnings: 0,
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return <Loader message="Chargement du dashboard" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
        <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <p className="text-zinc-400 text-center max-w-md">{error}</p>
        <Link
          href="/profile"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retourner au profil
        </Link>
      </div>
    );
  }

  const statCards = [
    { label: "Mangas", value: stats?.mangas || 0, icon: BookOpen, color: "text-blue-400" },
    { label: "Abonnés", value: stats?.followers || 0, icon: Users, color: "text-emerald-400" },
    { label: "Vues", value: stats?.views || 0, icon: Eye, color: "text-purple-400" },
    { label: "Likes", value: stats?.likes || 0, icon: Heart, color: "text-rose-400" },
    { label: "Chapitres", value: stats?.chapters || 0, icon: FileText, color: "text-amber-400" },
    { label: "Revenus", value: `${stats?.earnings || 0}$`, icon: DollarSign, color: "text-emerald-400" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Dashboard Créateur
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 max-w-4xl mx-auto w-full">
        
        {/* Info créateur avec icônes */}
        <div className="bg-gradient-to-r from-zinc-900/60 via-blue-950/30 to-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white flex items-center gap-2">
                @{user?.username}
                {user?.isCertified && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                    ✅ Certifié
                  </span>
                )}
                {user?.premiumActive && (
                  <Crown className="w-4 h-4 text-amber-400" />
                )}
              </p>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-700/30 text-[10px]">
                  {user?.role}
                </span>
                <span>•</span>
                <span>Membre depuis {new Date(user?.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center hover:border-blue-500/30 transition-colors">
                <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-zinc-500 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/creator/upload"
            className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-center font-medium transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Publier un manga
          </Link>
          <Link
            href="/creator/balance"
            className="p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-center font-medium transition-all border border-zinc-700/50 flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Gérer les revenus
          </Link>
        </div>

        {/* Si aucun manga */}
        {stats?.mangas === 0 && (
          <div className="mt-6 p-6 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl text-center">
            <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">Vous n'avez pas encore publié de manga</p>
            <Link
              href="/creator/upload"
              className="mt-3 inline-block px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all"
            >
              Publier votre premier manga
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
