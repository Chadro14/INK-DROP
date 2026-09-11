"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Loader2,
  Star,
  Flame,
  Zap,
  Gift,
  Target,
  BarChart3,
  Upload,
  FileText,
  ChevronDown,
  Vote,
  Swords,
  Palette,
  Rocket,
  TrendingUp,
  Award,
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
  config: any;
  rewards: {
    id: string;
    type: string;
    value: number;
    label: string;
    icon: string;
  }[];
  objectives: {
    id: string;
    description: string;
    target: number;
    current: number;
  }[];
  _count?: {
    participations: number;
    submissions: number;
  };
  userParticipation?: {
    id: string;
    isCompleted: boolean;
    rewardClaimed: boolean;
    progress: any;
    score: number;
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
  acceptsSubmissions: boolean;
  acceptsVotes: boolean;
  submitLabel: string;
  voteLabel: string;
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
    acceptsSubmissions: true,
    acceptsVotes: true,
    submitLabel: "Soumettre mon manga",
    voteLabel: "Voter pour un manga",
  },
  DESSIN: {
    icon: Palette,
    label: "Défi dessin",
    gradient: "from-purple-500 to-fuchsia-600",
    textColor: "text-purple-400",
    bgLight: "bg-purple-500/15",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/20",
    acceptsSubmissions: true,
    acceptsVotes: true,
    submitLabel: "Soumettre mon dessin",
    voteLabel: "Noter les dessins",
  },
  TICKETS: {
    icon: Ticket,
    label: "Semaine des Tickets",
    gradient: "from-blue-500 to-cyan-600",
    textColor: "text-blue-400",
    bgLight: "bg-blue-500/15",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/20",
    acceptsSubmissions: false,
    acceptsVotes: false,
    submitLabel: "",
    voteLabel: "",
  },
  RISING_CREATOR: {
    icon: Rocket,
    label: "Rising Creator",
    gradient: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-400",
    bgLight: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-500/20",
    acceptsSubmissions: false,
    acceptsVotes: false,
    submitLabel: "",
    voteLabel: "",
  },
  AWARDS: {
    icon: Crown,
    label: "INKDROP Awards",
    gradient: "from-rose-500 to-pink-600",
    textColor: "text-rose-400",
    bgLight: "bg-rose-500/15",
    border: "border-rose-500/40",
    glow: "shadow-rose-500/20",
    acceptsSubmissions: false,
    acceptsVotes: true,
    submitLabel: "",
    voteLabel: "Voter pour les nominations",
  },
  TOURNAMENT: {
    icon: Flame,
    label: "Tournament",
    gradient: "from-red-500 to-rose-600",
    textColor: "text-red-400",
    bgLight: "bg-red-500/15",
    border: "border-red-500/40",
    glow: "shadow-red-500/20",
    acceptsSubmissions: true,
    acceptsVotes: true,
    submitLabel: "S'inscrire au tournoi",
    voteLabel: "Voter pour un participant",
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
    acceptsSubmissions: false,
    acceptsVotes: false,
    submitLabel: "",
    voteLabel: "",
  };

export default function EventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // ============================================
  // CHARGEMENT
  // ============================================
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/events/${eventId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Événement non trouvé");

        const data = await res.json();
        setEvent(data.data);
        setError("");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // ============================================
  // REJOINDRE
  // ============================================
  const handleJoin = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setJoining(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message?.includes("déjà")) {
          const refreshed = await fetch(`${API_URL}/events/${eventId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (refreshed.ok) {
            const refreshedData = await refreshed.json();
            setEvent(refreshedData.data);
          }
          setJoining(false);
          return;
        }
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      setEvent((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          userParticipation: {
            id: data.data.id,
            isCompleted: false,
            rewardClaimed: false,
            progress: {},
            score: 0,
          },
          _count: {
            participations: (prev._count?.participations || 0) + 1,
            submissions: prev._count?.submissions || 0,
          },
        };
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  // ============================================
  // RÉCLAMER
  // ============================================
  const handleClaimReward = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setClaiming(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la réclamation");
      }

      setEvent((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          userParticipation: {
            ...prev.userParticipation!,
            rewardClaimed: true,
          },
        };
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return <Loader label="Chargement de l'événement..." />;
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Événement non trouvé</h2>
        <p className="text-muted-foreground max-w-md">
          {error || "L'événement que vous recherchez n'existe pas."}
        </p>
        <Link
          href="/events"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          Retour aux événements
        </Link>
      </div>
    );
  }

  // ============================================
  // DATES
  // ============================================
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const isActive = event.isActive && start <= now && end >= now;
  const isUpcoming = start > now;
  const isPast = end < now || !event.isActive;
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const isParticipating = !!event.userParticipation;
  const isCompleted = event.userParticipation?.isCompleted || false;
  const rewardClaimed = event.userParticipation?.rewardClaimed || false;

  const progress =
    event.objectives.length > 0
      ? (event.objectives.reduce((acc, obj) => {
          const current = event.userParticipation?.progress?.[obj.id] || 0;
          return acc + current / obj.target;
        }, 0) /
          event.objectives.length) *
        100
      : 0;

  const config = getTypeConfig(event.type);
  const Icon = config.icon;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isDescriptionLong = event.description && event.description.length > 200;

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-2xl border-b border-border/60">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 py-3">
          <Link
            href="/events"
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all text-sm font-semibold"
          >
            <div className="w-9 h-9 rounded-xl bg-card/60 border border-border/60 flex items-center justify-center group-hover:bg-card group-hover:border-border transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Événements</span>
          </Link>
          <span className="text-sm md:text-base font-bold tracking-tight truncate max-w-[200px] md:max-w-[400px]">
            {event.title}
          </span>
          <div className="w-9 h-9" />
        </div>
      </header>

      {/* ===== BANNIÈRE ===== */}
      <div className="relative h-56 md:h-72 w-full overflow-hidden">
        {/* Image ou gradient */}
        {event.coverUrl ? (
          <>
            <img
              src={event.coverUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          </>
        ) : (
          <>
            <div
              className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,hsl(var(--background)/0.4),transparent_70%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

            {/* Grande icône décorative */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Icon className="w-40 h-40 md:w-56 md:h-56 text-white" />
            </div>

            {/* Grille décorative */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </>
        )}

        {/* Badge TYPE en haut */}
        <div className="absolute top-4 left-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border ${config.border} ${config.bgLight} shadow-lg`}
          >
            <Icon className={`w-4 h-4 ${config.textColor}`} />
            <span
              className={`text-xs font-extrabold uppercase tracking-wider ${config.textColor}`}
            >
              {config.label}
            </span>
          </div>
        </div>

        {/* Statut en haut à droite */}
        <div className="absolute top-4 right-4">
          {isActive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/25 backdrop-blur-xl border border-emerald-500/50 text-emerald-300 text-xs font-extrabold uppercase tracking-wider shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En cours
            </div>
          )}
          {isUpcoming && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/25 backdrop-blur-xl border border-blue-500/50 text-blue-300 text-xs font-extrabold uppercase tracking-wider shadow-lg">
              <Clock className="w-3 h-3" />
              À venir
            </div>
          )}
          {isPast && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 backdrop-blur-xl border border-border text-muted-foreground text-xs font-extrabold uppercase tracking-wider shadow-lg">
              Terminé
            </div>
          )}
        </div>

        {/* Titre + infos en bas */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-5">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 drop-shadow-lg">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-sm border border-border/60 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>

              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-sm border border-border/60 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {event._count?.participations || 0} participants
              </span>

              {isActive && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-600/25 backdrop-blur-sm border border-amber-500/40 text-amber-300 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {daysLeft > 0 ? `${daysLeft}j restants` : "Dernier jour"}
                </span>
              )}

              {isParticipating && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/25 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Participant
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENU ===== */}
      <main className="max-w-5xl mx-auto w-full px-4 md:px-8 py-6 space-y-5">
        {/* THÈME */}
        {event.theme && (
          <div className="relative overflow-hidden bg-card/40 border border-border/80 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Thème
                </p>
                <p className="text-base font-semibold text-foreground">
                  {event.theme}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card/40 border border-border/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Participants
              </span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">
              {event._count?.participations || 0}
            </p>
          </div>

          <div className="bg-card/40 border border-border/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Soumissions
              </span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">
              {event._count?.submissions || 0}
            </p>
          </div>

          <div className="bg-card/40 border border-border/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Récompenses
              </span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">
              {event.rewards?.length || 0}
            </p>
          </div>

          <div className="bg-card/40 border border-border/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Objectifs
              </span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">
              {event.objectives?.length || 0}
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}
        {event.description && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Description
              </h3>
            </div>
            <p
              className={`text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-line ${
                !showFullDescription && isDescriptionLong ? "line-clamp-3" : ""
              }`}
            >
              {event.description}
            </p>
            {isDescriptionLong && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1 transition-colors"
              >
                {showFullDescription ? "Voir moins" : "Voir plus"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFullDescription ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>
        )}

        {/* OBJECTIFS */}
        {event.objectives && event.objectives.length > 0 && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Objectifs
              </h3>
            </div>

            <div className="space-y-3">
              {event.objectives.map((obj) => {
                const current = event.userParticipation?.progress?.[obj.id] || 0;
                const objProgress = Math.min((current / obj.target) * 100, 100);
                const isDone = objProgress >= 100;

                return (
                  <div
                    key={obj.id}
                    className={`relative overflow-hidden bg-muted/40 border rounded-xl p-4 transition-all ${
                      isDone
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Target className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {obj.description}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-foreground shrink-0">
                        {current} / {obj.target}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-background/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                        style={{ width: `${objProgress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {Math.round(objProgress)}% complété
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-bold text-emerald-400">
                          TERMINÉ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROGRESSION GLOBALE */}
        {isParticipating && (
          <div className="relative overflow-hidden bg-card/40 border border-border/80 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Votre progression
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full h-3 bg-background/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress >= 100
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xl font-extrabold text-foreground">
                  {Math.round(Math.min(progress, 100))}%
                </span>
              </div>

              {isCompleted && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
                  <Award className="w-4 h-4" />
                  Objectifs atteints ! Vous pouvez réclamer vos récompenses.
                </div>
              )}
            </div>
          </div>
        )}

        {/* RÉCOMPENSES */}
        {event.rewards && event.rewards.length > 0 && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Gift className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Récompenses
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {event.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden flex items-center gap-3 bg-muted/40 border border-border/60 rounded-xl px-4 py-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-background/60 border border-border/60 flex items-center justify-center shrink-0">
                    {reward.icon === "coins" && (
                      <Coins className="w-5 h-5 text-amber-400" />
                    )}
                    {reward.icon === "ticket" && (
                      <Ticket className="w-5 h-5 text-purple-400" />
                    )}
                    {reward.icon === "crown" && (
                      <Crown className="w-5 h-5 text-amber-400" />
                    )}
                    {reward.icon === "star" && (
                      <Star className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">
                      {reward.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ×{reward.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ACTIONS ===== */}
        <div className="flex flex-wrap gap-3 pt-2 pb-4">
          {/* SOUMETTRE */}
          {isParticipating && isActive && config.acceptsSubmissions && (
            <Link
              href={`/events/${event.id}/participate`}
              className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              {config.submitLabel}
            </Link>
          )}

          {/* VOTER */}
          {isParticipating && isActive && config.acceptsVotes && (
            <Link
              href={`/events/${event.id}/vote`}
              className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Vote className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {config.voteLabel}
            </Link>
          )}

          {/* PARTICIPER */}
          {!isParticipating && isActive && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Participer à l'événement
                </>
              )}
            </button>
          )}

          {/* RÉCLAMER */}
          {isParticipating && isCompleted && !rewardClaimed && (
            <button
              onClick={handleClaimReward}
              disabled={claiming}
              className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold transition-all shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {claiming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Réclamation...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Réclamer les récompenses
                </>
              )}
            </button>
          )}

          {/* RÉCOMPENSES RÉCLAMÉES */}
          {isParticipating && rewardClaimed && (
            <div className="flex-1 sm:flex-initial inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Récompenses réclamées
            </div>
          )}

          {/* TERMINÉ */}
          {isPast && (
            <div className="flex-1 sm:flex-initial inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-muted/40 border border-border text-muted-foreground text-sm font-medium">
              <Clock className="w-4 h-4" />
              Événement terminé
            </div>
          )}

          {/* À VENIR */}
          {isUpcoming && !isParticipating && (
            <div className="flex-1 sm:flex-initial inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Débute le {formatDate(event.startDate)}
            </div>
          )}

         
