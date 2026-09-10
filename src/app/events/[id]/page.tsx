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
  BarChart,
  Upload,
  FileText,
  ChevronDown,
  Vote,
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
// CONFIG PAR TYPE D'ÉVÉNEMENT
// ============================================
const EVENT_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    iconColor: string;
    acceptsSubmissions: boolean;
    acceptsVotes: boolean;
    submitLabel: string;
    voteLabel: string;
  }
> = {
  BATTLE: {
    label: "Battle de mangas",
    color: "text-amber-400",
    iconColor: "text-amber-400",
    acceptsSubmissions: true,
    acceptsVotes: true,
    submitLabel: "Soumettre mon manga",
    voteLabel: "Voter pour un manga",
  },
  DESSIN: {
    label: "Défi dessin",
    color: "text-purple-400",
    iconColor: "text-purple-400",
    acceptsSubmissions: true,
    acceptsVotes: true,
    submitLabel: "Soumettre mon dessin",
    voteLabel: "Noter les dessins",
  },
  TICKETS: {
    label: "Semaine des Tickets",
    color: "text-blue-400",
    iconColor: "text-blue-400",
    acceptsSubmissions: false,
    acceptsVotes: false,
    submitLabel: "",
    voteLabel: "",
  },
  RISING_CREATOR: {
    label: "Rising Creator",
    color: "text-emerald-400",
    iconColor: "text-emerald-400",
    acceptsSubmissions: false,
    acceptsVotes: false,
    submitLabel: "",
    voteLabel: "",
  },
  AWARDS: {
    label: "INKDROP Awards",
    color: "text-rose-400",
    iconColor: "text-rose-400",
    acceptsSubmissions: false,
    acceptsVotes: true,
    submitLabel: "",
    voteLabel: "Voter pour les nominations",
  },
  TOURNAMENT: {
    label: "Tournament",
    color: "text-red-400",
    iconColor: "text-red-400",
    acceptsSubmissions: true,
    acceptsVotes: true,
    submitLabel: "S'inscrire au tournoi",
    voteLabel: "Voter pour un participant",
  },
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
  // CHARGEMENT DE L'ÉVÉNEMENT
  // ============================================
  useEffect(() => {
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

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // ============================================
  // REJOINDRE L'ÉVÉNEMENT
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
        // ✅ Si déjà inscrit → recharger l'event sans afficher d'erreur
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

      // ✅ Succès → mettre à jour le state
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
  // RÉCLAMER LES RÉCOMPENSES
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

  // ============================================
  // ✅ ERREUR UNIQUEMENT SI L'EVENT N'EST PAS CHARGÉ
  // (fix : avant c'était "error || !event" ce qui cassait l'affichage)
  // ============================================
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
  // CALCUL DES DATES (corrigé : plus de concaténation invalide)
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

  const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.BATTLE;
  const Icon = getTypeIcon(event.type);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isDescriptionLong = event.description && event.description.length > 200;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href="/events"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Événements</span>
          </Link>
          <span className="text-base font-bold tracking-tight truncate max-w-[150px]">
            {event.title}
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-48 md:h-56 w-full bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-amber-950/40 border-b border-border/40 relative overflow-hidden">
        {event.coverUrl ? (
          <img
            src={event.coverUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`w-16 h-16 ${config.iconColor} opacity-50`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {event._count?.participations || 0} participants
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />
              <span className={`flex items-center gap-1 ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {isActive && (
              <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                En cours • {daysLeft}j restants
              </span>
            )}
            {isUpcoming && (
              <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                À venir
              </span>
            )}
            {isPast && (
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold border border-border">
                Terminé
              </span>
            )}
            {isParticipating && (
              <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                Participant
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">
        {/* THÈME */}
        {event.theme && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-4">
            <p className="text-sm">
              <span className="font-medium">Thème :</span>{" "}
              <span className="text-muted-foreground">{event.theme}</span>
            </p>
          </div>
        )}

        {/* DESCRIPTION */}
        {event.description && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Description
            </h3>
            <p
              className={`text-muted-foreground text-sm leading-relaxed ${
                !showFullDescription && isDescriptionLong ? "line-clamp-3" : ""
              }`}
            >
              {event.description}
            </p>
            {isDescriptionLong && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
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
          <div className="bg-card/40 border border-border/80 rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Objectifs
            </h3>
            <div className="space-y-3">
              {event.objectives.map((obj) => {
                const current = event.userParticipation?.progress?.[obj.id] || 0;
                const objProgress = Math.min((current / obj.target) * 100, 100);

                return (
                  <div
                    key={obj.id}
                    className="bg-muted/40 border border-border/60 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>{obj.description}</span>
                      <span className="text-muted-foreground font-medium">
                        {current} / {obj.target}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          objProgress >= 100
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                        style={{ width: `${Math.min(objProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROGRESSION */}
        {isParticipating && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-blue-400" />
              Progression globale
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress >= 100
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold">
                {Math.round(Math.min(progress, 100))}%
              </span>
            </div>
            {isCompleted && (
              <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Objectifs atteints !
              </div>
            )}
          </div>
        )}

        {/* RÉCOMPENSES */}
        {event.rewards && event.rewards.length > 0 && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              Récompenses
            </h3>
            <div className="flex flex-wrap gap-3">
              {event.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5"
                >
                  {reward.icon === "coins" && (
                    <Coins className="w-4 h-4 text-amber-400" />
                  )}
                  {reward.icon === "ticket" && (
                    <Ticket className="w-4 h-4 text-purple-400" />
                  )}
                  {reward.icon === "crown" && (
                    <Crown className="w-4 h-4 text-amber-400" />
                  )}
                  {reward.icon === "star" && (
                    <Star className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="text-sm font-medium">{reward.label}</span>
                  <span className="text-xs text-muted-foreground">
                    x{reward.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3 pb-4">
          {/* ✅ SOUMETTRE UNE ŒUVRE */}
          {isParticipating && isActive && config.acceptsSubmissions && (
            <Link
              href={`/events/${event.id}/participate`}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {config.submitLabel}
            </Link>
          )}

          {/* ✅ VOTER */}
          {isParticipating && isActive && config.acceptsVotes && (
            <Link
              href={`/events/${event.id}/vote`}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
            >
              <Vote className="w-4 h-4" />
              {config.voteLabel}
            </Link>
          )}

          {/* ✅ PARTICIPER */}
          {!isParticipating && isActive && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Participer
                </>
              )}
            </button>
          )}

          {/* ✅ RÉCLAMER LES RÉCOMPENSES */}
          {isParticipating && isCompleted && !rewardClaimed && (
            <button
              onClick={handleClaimReward}
              disabled={claiming}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {claiming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Réclamation...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  Réclamer les récompenses
                </>
              )}
            </button>
          )}

          {/* ✅ RÉCOMPENSES RÉCLAMÉES */}
          {isParticipating && rewardClaimed && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Récompenses réclamées
            </div>
          )}

          {/* ✅ ÉVÉNEMENT TERMINÉ */}
          {isPast && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-muted-foreground text-sm font-medium">
              <Clock className="w-4 h-4" />
              Événement terminé
            </div>
          )}

          {/* ✅ ÉVÉNEMENT À VENIR */}
          {isUpcoming && !isParticipating && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Débute le {formatDate(event.startDate)}
            </div>
          )}

          {/* ✅ CLASSEMENT */}
          <Link
            href={`/events/${event.id}/ranking`}
            className="px-6 py-2.5 rounded-xl bg-card/60 hover:bg-card/80 border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Voir le classement
          </Link>
        </div>

        {/* ERREUR SECONDAIRE (si elle apparaît après chargement) */}
        {error && event && (
          <div className="flex items-center gap-2 p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
