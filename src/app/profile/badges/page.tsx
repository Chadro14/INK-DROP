"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Trophy,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { BadgeCollection } from "@/components/BadgeDisplay";

const API_URL = "https://ink-backend.vercel.app";

type Badge = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  gradient: string | null;
  glowColor: string | null;
  rarity: string;
  category: string;
};

type UserBadge = {
  id: string;
  badge: Badge;
  earnedAt: string;
  isDisplayed: boolean;
};

export default function BadgesPage() {
  const router = useRouter();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ total: 0, displayed: 0 });

  useEffect(() => {
    const fetchBadges = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/badges/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur de chargement");

        const data = await res.json();
        setUserBadges(data.data || []);
        setStats({
          total: data.data?.length || 0,
          displayed: data.data?.filter((b: UserBadge) => b.isDisplayed).length || 0,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader label="Chargement des badges..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Profil</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Mes Badges
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 md:px-8 py-6 flex flex-col gap-6">

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-zinc-500">Badges débloqués</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.displayed}</p>
            <p className="text-xs text-zinc-500">Affichés sur le profil</p>
          </div>
        </div>

        {/* ERREUR */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* COLLECTION DE BADGES */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Ma Collection</h2>
          </div>

          {userBadges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium">Aucun badge débloqué</p>
              <p className="text-zinc-500 text-sm mt-1">
                Participe à des événements pour gagner des badges exclusifs !
              </p>
              <Link
                href="/events"
                className="mt-4 inline-block px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                Voir les événements
              </Link>
            </div>
          ) : (
            <BadgeCollection userBadges={userBadges} />
          )}
        </div>

        {/* LÉGENDE DES RARETÉS */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-2">Légende des raretés</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-zinc-800/60 text-zinc-400 border border-zinc-700/50">Commun</span>
            <span className="px-2 py-1 rounded-full bg-blue-950/40 text-blue-400 border border-blue-500/30">Peu commun</span>
            <span className="px-2 py-1 rounded-full bg-purple-950/40 text-purple-400 border border-purple-500/30">Rare</span>
            <span className="px-2 py-1 rounded-full bg-violet-950/40 text-violet-400 border border-violet-500/30">Épique</span>
            <span className="px-2 py-1 rounded-full bg-amber-950/40 text-amber-400 border border-amber-500/30 animate-pulse">Légendaire</span>
            <span className="px-2 py-1 rounded-full bg-red-950/40 text-red-400 border border-red-500/30 animate-pulse">Ultime</span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
