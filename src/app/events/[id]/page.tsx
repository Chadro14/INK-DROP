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
  ArrowLeft,
  Swords,
  Palette,
  Rocket,
  Loader2,
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

// ============================================
// CONFIG PAR TYPE
// ============================================
type TypeConfig = {
  icon: any;
  label: string;
  gradient: string;
  textColor: string;
  bgLight: string;
  border: string;
  glow: string;
};

const TYPE_CONFIG: Record<string, TypeConfig> = {
  BATTLE: {
    icon: Swords,
    label: "Battle de mangas",
    gradient: "from-amber-500 to-orange-600",
    textColor: "text-amber-400",
    bgLight: "bg-amber-500/15",
    border: "border-amber-500/40",
    glow: "shadow-amber-500/20",
  },
  DESSIN: {
    icon: Palette,
    label: "Défi dessin",
    gradient: "from-purple-500 to-fuchsia-600",
    textColor: "text-purple-400",
    bgLight: "bg-purple-500/15",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/20",
  },
  TICKETS: {
    icon: Ticket,
    label: "Semaine des Tickets",
    gradient: "from-blue-500 to-cyan-600",
    textColor: "text-blue-400",
    bgLight: "bg-blue-500/15",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/20",
  },
  RISING_CREATOR: {
    icon: Rocket,
    label: "Rising Creator",
    gradient: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-400",
    bgLight: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-500/20",
  },
  AWARDS: {
    icon: Crown,
    label: "INKDROP Awards",
    gradient: "from-rose-500 to-pink-600",
    textColor: "text-rose-400",
    bgLight: "bg-rose-500/15",
    border: "border-rose-500/40",
    glow: "shadow-rose-500/20",
  },
  TOURNAMENT: {
    icon: Flame,
    label: "Tournament",
    gradient: "from-red-500 to-rose-600",
    textColor: "text-red-400",
    bgLight: "bg-red-500/15",
    border: "border-red-500/40",
    glow: "shadow-red-500/20",
  },
};

const getTypeConfig = (type: string): TypeConfig =>
  TYPE_CONFIG[type] || {
    icon: Zap,
    label: type,
    gradient: "from-muted to-muted/50",
    textColor: "text-muted-foreground",
    bgLight: "bg-muted/40",
    border: "border-border",
    glow: "shadow-none",
  };

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "past">("active");

  // ============================================
  // CHARGEMENT DES ÉVÉNEMENTS
  // ✅ setLoading uniquement au premier chargement
  // ============================================
  useEffect(() => {
    let isFirstLoad = true;

    const fetchEvents = async () => {
      // ✅ Loader complet SEULEMENT au premier chargement
      if (isFirstLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/events?filter=${filter}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Erreur lors du chargement des événements");

        const data = await res.json();
        setEvents(data.data || []);
        setError("");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFirstLoad = false;
      }
    };

    fetchEvents();
  }, [filter]);

  // ============================================
  // STATUT
  // ============================================
  const getStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (!event.isActive || end < now)
      return {
        label: "Terminé",
        color: "bg-muted/80 text-muted-foreground border-border",
      };
    if (start > now)
      return {
        label: "À venir",
        color: "bg-blue-600/20 text-blue-400 border-blue-500/40",
      };
    return {
      label: "En cours",
      color: "bg-emerald-600/20 text-emerald-400 border-emerald-500/40",
    };
  };

  // ============================================
  // LOADER INITIAL
  // ============================================
  if (loading) {
    return <Loader label="Chargement des événements..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Accueil</span>
          </Link>
          <span className="text-base font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Événements
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full">
        {/* ===== HERO BANNER ===== */}
        <div className="relative overflow-hidden rounded-3xl mb-8 border border-border/60 bg-card/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--foreground)/0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--foreground)/0.05),transparent_60%)]" />

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative px-6 py-10 md:py-14 text-center">
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-2xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/40 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Trophy className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Événements & Compétitions
              </span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Participe à des événements exclusifs, affronte d'autres créateurs
              et remporte des récompenses uniques sur INKDROP.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-6">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-border/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-foreground">
                  6 types d'événements
                </span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-border/60">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-foreground">
                  Récompenses MANAS & Tickets
                </span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-border/60">
                <Crown className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-bold text-foreground">
                  Badges exclusifs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FILTRES ===== */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {[
            { key: "active", label: "En cours" },
            { key: "upcoming", label: "À venir" },
            { key: "past", label: "Passés" },
            { key: "all", label: "Tous" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              disabled={refreshing}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
                filter === f.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                  : "bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card/60 border border-border/60"
              }`}
            >
              {f.label}
            </button>
          ))}

          {/* Petit spinner pendant le refresh (discret) */}
          {refreshing && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Chargement...
            </div>
          )}
        </div>

        {/* ===== ERREUR ===== */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ===== LISTE DES ÉVÉNEMENTS ===== */}
        {events.length === 0 ? (
          <div className="text-center py-20 bg-card/20 rounded-3xl border border-border/40">
            <div className="w-20 h-20 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-foreground font-bold mb-1">
              Aucun événement disponible
            </p>
            <p className="text-muted-foreground text-sm">
              Reviens plus tard pour découvrir de nouveaux défis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => {
              const status = getStatus(event);
              const config = getTypeConfig(event.type);
              const Icon = config.icon;
              const now = new Date();
              const end = new Date(event.endDate);
              const daysLeft = Math.max(
                0,
                Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              );
              const isParticipating = !!event.userParticipation;
              const isCompleted = event.userParticipation?.isCompleted || false;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className={`group relative bg-card/40 border border-border/80 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl ${config.glow}`}
                >
                  {/* COUVERTURE */}
                  <div className="relative h-40 overflow-hidden">
                    {event.coverUrl ? (
                      <>
                        <img
                          src={event.coverUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                      </>
                    ) : (
                      <>
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-90`}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--background)/0.3),transparent_60%)]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-25">
                          <Icon className="w-24 h-24 text-white" />
                        </div>
                      </>
                    )}

                    {/* Badge TYPE */}
                    <div
                      className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-full backdrop-blur-md border ${config.border} ${config.bgLight} flex items-center gap-1.5 shadow-lg`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wide ${config.textColor}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    {/* Badge STATUT */}
                    <div
                      className={`absolute top-3 right-3 px-2.5 py-1.5 rounded-full backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wide border ${status.color}`}
                    >
                      {status.label}
                    </div>

                    {isParticipating && (
                      <div
                        className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-extrabold border ${
                          isCompleted
                            ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                            : "bg-blue-600/30 text-blue-300 border-blue-500/50"
                        }`}
                      >
                        {isCompleted ? "Objectifs atteints" : "En cours"}
                      </div>
                    )}

                    {event.isActive && end >= now && (
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-md text-[10px] font-extrabold border border-border/60 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span className="text-foreground">
                          {daysLeft > 0 ? `${daysLeft}j` : "Dernier jour"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CONTENU */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-extrabold leading-tight group-hover:opacity-80 transition-opacity line-clamp-2 min-h-[2.75rem] text-foreground">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {event.theme && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">
                          Thème :{" "}
                          <span className="text-foreground font-medium">
                            {event.theme}
                          </span>
                        </span>
                      </div>
                    )}

                    <div className="border-t border-border/40 pt-3 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.startDate).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })}{" "}
                          -{" "}
                          {new Date(event.endDate).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>

                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          {event._count?.participations || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold text-amber-400">
                            {event.rewards?.length || 0} récompense
                            {(event.rewards?.length || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-foreground/70 group-hover:text-foreground group-hover:gap-2 transition-all">
                          <span>Voir</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`h-1 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
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
