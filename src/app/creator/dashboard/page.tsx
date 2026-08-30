// src/app/creator/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Coins, 
  TrendingUp,
  Eye,
  Heart,
  Crown,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function CreatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // ✅ Utiliser /auth/me au lieu de /users/me
        const [userRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/creator/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) {
          if (userRes.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Erreur de chargement du profil");
        }

        const userData = await userRes.json();
        setUser(userData);

        if (userData.role !== "CREATOR" && userData.role !== "ADMIN") {
          setError("Vous n'êtes pas un créateur");
          setLoading(false);
          return;
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

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
            <BookOpen className="w-4 h-4 text-blue-400" />
            Dashboard Créateur
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full">
        
        {/* Info créateur */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">@{user?.username}</p>
              <p className="text-xs text-zinc-500">Créateur certifié</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.mangas || 0}</p>
            <p className="text-xs text-zinc-500">Mangas</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.followers || 0}</p>
            <p className="text-xs text-zinc-500">Abonnés</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
            <Eye className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.views || 0}</p>
            <p className="text-xs text-zinc-500">Vues</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
            <Coins className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats?.earnings || 0}$</p>
            <p className="text-xs text-zinc-500">Revenus</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/creator/upload"
            className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-center font-medium transition-all shadow-lg shadow-blue-900/30"
          >
            <BookOpen className="w-5 h-5 mx-auto mb-1" />
            Publier un manga
          </Link>
          <Link
            href="/creator/balance"
            className="p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-center font-medium transition-all border border-zinc-700/50"
          >
            <Coins className="w-5 h-5 mx-auto mb-1" />
            Gérer les revenus
          </Link>
        </div>
      </main>
    </div>
  );
}
