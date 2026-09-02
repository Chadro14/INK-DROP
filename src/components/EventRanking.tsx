"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Users, 
  Eye, 
  Heart,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface RankingItem {
  id: string;
  userId: string;
  eventId: string;
  score: number;
  rank: number;
  metrics?: {
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
}

interface EventRankingProps {
  eventId: string;
  limit?: number;
  showMetrics?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function EventRanking({ 
  eventId, 
  limit = 20, 
  showMetrics = true,
  autoRefresh = true,
  refreshInterval = 30000,
}: EventRankingProps) {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRanking = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://ink-backend.vercel.app"}/events/${eventId}/ranking?limit=${limit}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Erreur lors du chargement du classement");

      const data = await res.json();
      setRanking(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchRanking(true);
    }
  }, [eventId, limit]);

  useEffect(() => {
    if (!autoRefresh || !eventId) return;

    const interval = setInterval(() => {
      fetchRanking(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, eventId, refreshInterval]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-zinc-500">#{rank}</span>;
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return "border-amber-500/30 bg-amber-950/10";
    if (rank === 2) return "border-zinc-500/30 bg-zinc-950/10";
    if (rank === 3) return "border-amber-700/30 bg-amber-950/5";
    return "border-zinc-800/50";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <p className="text-sm">{error}</p>
        <button
          onClick={() => fetchRanking(true)}
          className="mt-3 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 text-sm hover:bg-blue-600/30 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
        <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-400 font-medium">Aucun participant</p>
        <p className="text-zinc-500 text-xs mt-1">
          Le classement se remplira au fur et à mesure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          Classement
          <span className="text-xs text-zinc-500 font-normal">
            ({ranking.length} participants)
          </span>
        </h3>
        <button
          onClick={() => fetchRanking(false)}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Liste */}
      {ranking.map((item) => {
        const rank = item.rank || ranking.indexOf(item) + 1;
        const isTop3 = rank <= 3;

        return (
          <Link
            key={item.id}
            href={`/profile/${item.user.username}`}
            className={`flex items-center gap-4 p-3 rounded-xl border transition-all hover:scale-[1.01] ${getRankClass(rank)} hover:bg-zinc-900/50`}
          >
            {/* Rang */}
            <div className="w-8 text-center flex-shrink-0">
              {isTop3 ? (
                <div className="flex items-center justify-center">
                  {getRankIcon(rank)}
                </div>
              ) : (
                <span className="text-sm font-bold text-zinc-500">#{rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/50 flex-shrink-0">
              {item.user.avatarUrl ? (
                <img
                  src={item.user.avatarUrl}
                  alt={item.user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-400 bg-zinc-800">
                  {item.user.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white text-sm truncate">
                  {item.user.username}
                </p>
                {item.user.isCertified && (
                  <svg
                    className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                )}
                {isTop3 && (
                  <span className="text-xs">
                    {rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉"}
                  </span>
                )}
              </div>
              {showMetrics && item.metrics && (
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    {item.score} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-purple-400" />
                    {item.metrics.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    {item.metrics.likes || 0}
                  </span>
                </div>
              )}
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-white">{item.score}</p>
              <p className="text-[10px] text-zinc-500">pts</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
