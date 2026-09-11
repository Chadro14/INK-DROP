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
  ThumbsUp,
  Clock,
  AlertCircle,
  TrendingUp,
  BadgeCheck,
  RefreshCw,
  Pause,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type RankingItem = {
  id: string;
  userId: string;
  eventId: string;
  score: number;
  rank: number;
  metrics: {
    votes?: number;
    weightedScore?: number;
    views?: number;
    likes?: number;
    subscribers?: number;
  };
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    avatarColor?: string | null;
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

// ============================================
// BADGE CERTIFIÉ
// ============================================
function CertifiedBadge({ user }: { user: RankingItem["user"] }) {
  if (!user?.isCertified) return null;

  const badgeColor = user.badgeColor || user.avatarColor || "#3B82F6";

  return (
    <BadgeCheck
      className="w-4 h-4 shrink-0"
      fill={badgeColor}
      color="black"
      strokeWidth={1.5}
    />
  );
}

export default function EventRankingPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================
  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // 1. Charger l'événement
        const eventRes = await fetch(`${API_URL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!eventRes.ok) throw new Error("Événement non trouvé");

        const eventData = await eventRes.json();
        setEvent(eventData.data);

        // 2. Charger le classement
        const rankingRes = await fetch(
          `${API_URL}/events/${eventId}/ranking?limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (rankingRes.ok) {
          const rankingData = await rankingRes.json();
          setRanking(rankingData.data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchAll();
    }
  }, [eventId, router]);

  // ============================================
  // REFRESH MANUEL
  // ============================================
  const refreshRanking = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setRefreshing(true);
    try {
      const res = await fetch(
        `${API_URL}/events/${eventId}/ranking?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setRanking(data.data || []);
      }
    } catch (err) {
      console.error("Erreur refresh:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  // ============================================
  // AUTO REFRESH
  // ============================================
  useEffect(() => {
    if (!autoRefresh || !eventId) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          `${API_URL}/events/${eventId}/ranking?limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setRanking(data.data || []);
        }
      } catch (err) {
        console.error("Erreur auto-refresh:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, eventId]);

  // ============================================
  // ICÔNES DE RANG
  // ============================================
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    );
  };

  const getRankBg = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-amber-500/20 to-amber-600/5 border-amber-500/40 hover:border-amber-400/60";
    if (rank === 2)
      return "bg-gradient-to-r from-zinc-400/20 to-zinc-500/5 border-zinc-400/40 hover:border-zinc-300/60";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-700/20 to-amber-800/5 border-amber-700/40 hover:border-amber-600/60";
    return "bg-card/40 border-border/60 hover:border-blue-500/30";
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return <Loader label="Chargement du classement..." />;
  }

  // ============================================
  // ERREUR UNIQUEMENT SI L'ÉVÉNEMENT N'EST PAS CHARGÉ
  // ============================================
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Classement indisponible</h2>
        <p className="text-muted-foreground max-w-md">
          {error || "Impossible de charger le classement."}
        </p>
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

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href={`/events/${eventId}`}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Classement
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">
        {/* INFO ÉVÉNEMENT */}
        <div className="bg-card/40 border border-border/80 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">{event.title}</h2>
              <p className="text-xs text-muted-foreground">
                {event._count?.participations || 0} participant
                {(event._count?.participations || 0) !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isActive ? (
                <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  En cours
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold border border-border">
                  Terminé
                </span>
              )}

              {/* Bouton refresh manuel */}
              <button
                onClick={refreshRanking}
                disabled={refreshing}
                className="p-1.5 rounded-full bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                title="Rafraîchir"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>

              {/* Toggle auto-refresh */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                  autoRefresh
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                    : "bg-card/50 text-muted-foreground border-border"
                }`}
              >
                {autoRefresh ? (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Auto
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3" />
                    Pause
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CLASSEMENT */}
        {ranking.length === 0 ? (
          <div className="text-center py-16 bg-card/30 rounded-2xl border border-border/40">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              Aucun participant
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Le classement se remplira au fur et à mesure que les participants
              s'inscriront.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((item, index) => {
              const rank = item.rank || index + 1;
              const isTop3 = rank <= 3;
              const votesCount = item.metrics?.votes || 0;

              return (
                <Link
                  key={item.id}
                  href={`/creator/${item.user.username}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group hover:scale-[1.01] ${getRankBg(
                    rank
                  )}`}
                >
                  {/* RANG */}
                  <div className="w-10 flex items-center justify-center shrink-0">
                    {isTop3 ? (
                      getRankIcon(rank)
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* AVATAR */}
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden border border-border/50 shrink-0 flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      backgroundColor: item.user.avatarColor || "#8B5CF6",
                    }}
                  >
                    {item.user.avatarUrl ? (
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      item.user.username?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>

                  {/* INFOS */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">
                        {item.user.username}
                      </p>
                      <CertifiedBadge user={item.user} />
                    </div>

                    {/* MÉTRIQUES */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      {/* Votes */}
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-400" />
                        {votesCount} vote{votesCount !== 1 ? "s" : ""}
                      </span>

                      {/* Score */}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        {item.score} pt{item.score !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* SCORE */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{item.score}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* STATS GLOBALES */}
        {ranking.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card/40 border border-border/80 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold">
                {ranking.reduce((acc, item) => acc + item.score, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Points totaux</p>
            </div>

            <div className="bg-card/40 border border-border/80 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold">{ranking.length}</p>
              <p className="text-[10px] text-muted-foreground">Participants</p>
            </div>

            <div className="bg-card/40 border border-border/80 rounded-xl p-3 text-center">
              <ThumbsUp className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold">
                {ranking.reduce(
                  (acc, item) => acc + (item.metrics?.votes || 0),
                  0
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">Votes totaux</p>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
