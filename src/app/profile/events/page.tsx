"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  Users,
  Sparkles,
  Crown,
  Coins,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Star,
  Flame,
  Zap,
  ChevronRight,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Event = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  theme: string | null;
  icon: string | null;
  coverUrl: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  rewards: any[];
  objectives: any[];
  _count?: {
    participations: number;
  };
  userParticipation?: {
    id: string;
    isCompleted: boolean;
    rewardClaimed: boolean;
    progress: any;
    score: number;
  };
};

export default function MyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  useEffect(() => {
    const fetchMyEvents = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/events?filter=all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur lors du chargement");

        const data = await res.json();
        const allEvents = data.data || [];

        // Filtrer les événements où l'utilisateur participe
        const myEvents = allEvents.filter((e: any) => e.userParticipation);
        setEvents(myEvents);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [router]);

  const getFilteredEvents = () => {
    const now = new Date();

    if (filter === "active") {
      return events.filter((e) => {
        const end = new Date(e.endDate);
        return e.isActive && end >= now;
      });
    }

    if (filter === "completed") {
      return events.filter((e) => {
        const end = new Date(e.endDate);
        return !e.isActive || end < now || e.userParticipation?.isCompleted;
      });
    }

    return events;
  };

  const getStatus = (event: Event) => {
    const now = new Date();
    const end = new Date(event.endDate);

    if (event.userParticipation?.isCompleted) {
      return { label: "✅ Terminé", color: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" };
    }
    if (end < now) {
      return { label: "⏰ Expiré", color: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" };
    }
    return { label: "📌 En cours", color: "bg-blue-600/20 text-blue-400 border-blue-500/30 animate-pulse" };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BATTLE: "⚔️ Battle",
      DESSIN: "🎨 Défi Dessin",
      TICKETS: "🎟️ Tickets",
      RISING_CREATOR: "🚀 Rising Creator",
      AWARDS: "👑 Awards",
      TOURNAMENT: "💥 Tournament",
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      BATTLE: Trophy,
      DESSIN: Sparkles,
      TICKETS: Ticket,
      RISING_CREATOR: Star,
      AWARDS: Crown,
      TOURNAMENT: Flame,
    };
    return icons[type] || Zap;
  };

  const getProgress = (event: Event) => {
    if (!event.objectives || event.objectives.length === 0) return 0;
    const total = event.objectives.length;
    const completed = event.objectives.filter((obj) => {
      const current = event.userParticipation?.progress?.[obj.id] || 0;
      return current >= obj.target;
    }).length;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader label="Chargement de vos événements..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
        <p className="text-zinc-400 max-w-md">{error}</p>
        <Link
          href="/profile"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Profil</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Mes événements
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full">

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{events.length}</p>
            <p className="text-[10px] text-zinc-500">Total</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">
              {events.filter((e) => e.userParticipation?.isCompleted).length}
            </p>
            <p className="text-[10px] text-zinc-500">Terminés</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-400">
              {events.filter((e) => {
                const end = new Date(e.endDate);
                return e.isActive && end >= new Date() && !e.userParticipation?.isCompleted;
              }).length}
            </p>
            <p className="text-[10px] text-zinc-500">En cours</p>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "active", label: "En cours" },
            { key: "completed", label: "Terminés" },
            { key: "all", label: "Tous" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LISTE */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">Aucun événement trouvé</p>
            <p className="text-zinc-500 text-xs mt-1">
              {filter === "active"
                ? "Vous n'avez pas d'événement en cours."
                : filter === "completed"
                ? "Vous n'avez pas encore terminé d'événement."
                : "Participez à un événement pour le voir apparaître ici."}
            </p>
            <Link
              href="/events"
              className="mt-4 inline-block px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Voir les événements
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => {
              const status = getStatus(event);
              const Icon = getTypeIcon(event.type);
              const progress = getProgress(event);
              const now = new Date();
              const end = new Date(event.endDate);
              const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:scale-[1.02] duration-300"
                >
                  <div className="relative h-32 bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-amber-950/40 flex items-center justify-center">
                    {event.coverUrl ? (
                      <img
                        src={event.coverUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-12 h-12 text-amber-400/50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                      {status.label}
                    </span>
                    {event.isActive && end >= now && !event.userParticipation?.isCompleted && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-zinc-950/80 text-white text-[10px] font-bold border border-zinc-700/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysLeft > 0 ? `${daysLeft}j restants` : "Dernier jour"}
                      </span>
                    )}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            progress >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {event._count?.participations || 0}
                      </span>
                      {progress > 0 && (
                        <span className="text-white font-medium">{progress}%</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-1">
                        Voir détails <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
