"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Trophy,
  Crown,
  Medal,
  Star,
  Users,
  Eye,
  Heart,
  Coins,
  Clock,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type RankingItem = {
  id: string;
  userId: string;
  eventId: string;
  score: number;
  rank: number;
  metrics: {
    votes: number;
    views: number;
    likes: number;
    subscribers: number;
  };
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isCertified: boolean;
    badgeColor: string | null;
  };
};

type Event = {
  id: string;
  title: string;
  type: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  _count?: {
    participations: number;
  };
};

export default function EventRankingPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/events/${eventId}/ranking?limit=50`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Erreur lors du chargement du classement");

        const data = await res.json();
        setRanking(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/events/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Événement non trouvé");

        const data = await res.json();
        setEvent(data.data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (eventId) {
      fetchEvent();
      fetchRanking();

      // Rafraîchissement automatique toutes les 30 secondes
      const interval = setInterval(() => {
        if (autoRefresh) {
          fetchRanking();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [eventId, autoRefresh]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-zinc-500">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400/50";
    if (rank === 2)
      return "bg-gradient-to-r from-zinc-400 to-zinc-300 text-white border-zinc-300/50";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-700 to-amber-600 text-white border-amber-500/50";
    return "bg-zinc-800/50 text-zinc-400 border-zinc-700/50";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader label="Chargement du classement..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Classement indisponible</h2>
        <p className="text-zinc-400 max-w-md">{error || "Le classement n'est pas disponible."}</p>
        <Link
          href={`/events/${eventId}`}
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          Retour à l'événement
        </Link>
      </div>
    );
  }

  const now = new Date();
  const end = new Date(event.endDate);
  const isActive = event.isActive && now <= end;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href={`/events/${eventId}`}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Classement
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 flex flex-col gap-6">

        {/* INFO ÉVÉNEMENT */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{event.title}</h2>
              <p className="text-xs text-zinc-500">
                {event._count?.participations || 0} participants
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isActive ? (
                <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  En cours
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-zinc-600/20 text-zinc-400 text-xs font-bold border border-zinc-600/30">
                  Terminé
                </span>
              )}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  autoRefresh
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                    : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
                }`}
              >
                {autoRefresh ? "🔄 Auto" : "⏸️ Pause"}
              </button>
            </div>
          </div>
        </div>

        {/* CLASSEMENT */}
        {ranking.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
            <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">Aucun participant</p>
            <p className="text-zinc-500 text-xs mt-1">
              Le classement se remplira au fur et à mesure que les participants s'inscriront.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((item, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <Link
                  key={item.id}
                  href={`/creator/${item.user.username}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                    isTop3
                      ? "bg-gradient-to-r from-zinc-900/60 to-zinc-900/20 border-amber-500/30 hover:border-amber-400/50"
                      : "bg-zinc-900/40 border-zinc-800/60 hover:border-blue-500/30"
                  }`}
                >
                  {/* Rang */}
                  <div className="w-10 text-center">
                    {isTop3 ? (
                      <div className="flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-zinc-500">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/50 shrink-0">
                    {item.user.avatarUrl ? (
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-400 bg-zinc-800">
                        {item.user.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate">
                        {item.user.username}
                      </p>
                      {item.user.isCertified && (
                        <svg
                          className="w-4 h-4 text-blue-400 fill-blue-400/20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      )}
                      {isTop3 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getRankBadge(
                            rank
                          )}`}
                        >
                          {rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        {item.score} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-purple-400" />
                        {item.metrics?.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        {item.metrics?.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-400" />
                        {item.metrics?.subscribers || 0}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{item.score}</p>
                    <p className="text-[10px] text-zinc-500">points</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* STATS GLOBALES */}
        {ranking.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">
                {ranking.reduce((acc, item) => acc + item.score, 0)}
              </p>
              <p className="text-[10px] text-zinc-500">Points totaux</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{ranking.length}</p>
              <p className="text-[10px] text-zinc-500">Participants</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
              <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">
                {ranking.filter((item) => item.score > 0).length}
              </p>
              <p className="text-[10px] text-zinc-500">Actifs</p>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
