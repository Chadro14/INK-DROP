"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  Calendar,
  Clock,
  Trophy,
  Users,
  Sparkles,
  Crown,
  Coins,
  Ticket,
  ChevronRight,
  AlertCircle,
  Star,
  Flame,
  Zap,
  Eye,
  Heart,
  FileText,
  ArrowLeft,
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
  };
};

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "past">("active");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/events?filter=${filter}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Erreur lors du chargement des événements");

        const data = await res.json();
        setEvents(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filter]);

  const getStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate + 'T00:00:00Z');
    const end = new Date(event.endDate + 'T23:59:59Z');

    if (!event.isActive) return { label: "Terminé", color: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" };
    if (start > now) return { label: "À venir", color: "bg-blue-600/20 text-blue-400 border-blue-500/30" };
    if (end < now) return { label: "Terminé", color: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" };
    return { label: "En cours", color: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" };
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
    const Icon = icons[type] || Zap;
    return Icon;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BATTLE: "Battle de mangas",
      DESSIN: "Défi dessin",
      TICKETS: "Semaine des Tickets",
      RISING_CREATOR: "Rising Creator",
      AWARDS: "INKDROP Awards",
      TOURNAMENT: "Tournament",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BATTLE: "text-amber-400 bg-amber-950/30 border-amber-500/30",
      DESSIN: "text-purple-400 bg-purple-950/30 border-purple-500/30",
      TICKETS: "text-blue-400 bg-blue-950/30 border-blue-500/30",
      RISING_CREATOR: "text-emerald-400 bg-emerald-950/30 border-emerald-500/30",
      AWARDS: "text-rose-400 bg-rose-950/30 border-rose-500/30",
      TOURNAMENT: "text-red-400 bg-red-950/30 border-red-500/30",
    };
    return colors[type] || "text-zinc-400 bg-zinc-950/30 border-zinc-500/30";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader label="Chargement des événements..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Accueil</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Événements
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full">

        {/* BANNIÈRE */}
        <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-amber-950/40 border border-zinc-800/80 rounded-2xl p-6 mb-8 text-center">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-white">Événements et Compétitions</h1>
          <p className="text-zinc-400 text-sm max-w-2xl mx-auto mt-2">
            Participe à des événements exclusifs, gagne des récompenses et deviens une légende sur INKDROP.
          </p>
        </div>

        {/* FILTRES */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "active", label: "En cours" },
            { key: "upcoming", label: "À venir" },
            { key: "past", label: "Passés" },
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

        {/* ERREUR */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LISTE DES ÉVÉNEMENTS */}
        {events.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
            <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">Aucun événement disponible</p>
            <p className="text-zinc-500 text-xs mt-1">Reviens plus tard pour découvrir de nouveaux événements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => {
              const status = getStatus(event);
              const Icon = getTypeIcon(event.type);
              const typeColor = getTypeColor(event.type);
              const now = new Date();
              const end = new Date(event.endDate + 'T23:59:59Z');
              const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isParticipating = !!event.userParticipation;
              const isCompleted = event.userParticipation?.isCompleted || false;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:scale-[1.02] duration-300"
                >
                  {/* Image de couverture */}
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
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${typeColor}`}>
                      {getTypeLabel(event.type)}
                    </span>
                    {event.isActive && end >= now && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-zinc-950/80 text-white text-[10px] font-bold border border-zinc-700/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysLeft > 0 ? `${daysLeft}j restants` : "Dernier jour"}
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-zinc-950/80 text-white text-[10px] font-bold border border-zinc-700/50 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event._count?.participations || 0} participants
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      {isParticipating && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isCompleted 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}>
                          {isCompleted ? "Terminé" : "En cours"}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-zinc-400 text-xs line-clamp-2">{event.description}</p>
                    )}
                    {event.theme && (
                      <p className="text-zinc-500 text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Thème : {event.theme}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400 font-medium">{event.rewards?.length || 0} récompenses</span>
                      </div>
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
