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
  User,
  Upload,
  Eye,
  Heart,
  FileText,
  ChevronDown,
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
          setError("Vous participez déjà à cet événement");
          setEvent((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              userParticipation: {
                id: "existing",
                isCompleted: false,
                rewardClaimed: false,
                progress: {},
                score: 0,
              },
            };
          });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader label="Chargement de l'événement..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Événement non trouvé</h2>
        <p className="text-zinc-400 max-w-md">{error || "L'événement que vous recherchez n'existe pas."}</p>
        <Link
          href="/events"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          Retour aux événements
        </Link>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(event.startDate + 'T00:00:00Z');
  const end = new Date(event.endDate + 'T23:59:59Z');
  const isActive = event.isActive && start <= now && end >= now;
  const isUpcoming = start > now;
  const isPast = end < now || !event.isActive;
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isParticipating = !!event.userParticipation;
  const isCompleted = event.userParticipation?.isCompleted || false;
  const rewardClaimed = event.userParticipation?.rewardClaimed || false;

  const progress = event.objectives.length > 0 
    ? event.objectives.reduce((acc, obj) => {
        const current = event.userParticipation?.progress?.[obj.id] || 0;
        return acc + (current / obj.target);
      }, 0) / event.objectives.length * 100
    : 0;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BATTLE: "text-amber-400",
      DESSIN: "text-purple-400",
      TICKETS: "text-blue-400",
      RISING_CREATOR: "text-emerald-400",
      AWARDS: "text-rose-400",
      TOURNAMENT: "text-red-400",
    };
    return colors[type] || "text-zinc-400";
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

  const Icon = getTypeIcon(event.type);
  const typeColor = getTypeColor(event.type);

  // ✅ CORRECTION : Les événements DESSIN, BATTLE et TOURNAMENT acceptent les soumissions
  const acceptsSubmissions = event.type === "DESSIN" || event.type === "BATTLE" || event.type === "TOURNAMENT";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isDescriptionLong = event.description && event.description.length > 200;

  // ✅ DIAGNOSTIC - Affiche les valeurs dans la console
  console.log("🔍 DIAGNOSTIC:");
  console.log("📌 event.type:", event.type);
  console.log("📌 isParticipating:", isParticipating);
  console.log("📌 isActive:", isActive);
  console.log("📌 acceptsSubmissions:", acceptsSubmissions);
  console.log("📌 userParticipation:", event.userParticipation);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/events" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Événements</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight truncate max-w-[150px]">
            {event.title}
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-48 md:h-56 w-full bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-amber-950/40 border-b border-zinc-800/40 relative overflow-hidden flex-shrink-0">
        {event.coverUrl ? (
          <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`w-16 h-16 ${typeColor}/50`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block" />
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {event._count?.participations || 0} participants
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block" />
              <span className={`flex items-center gap-1 ${typeColor}`}>
                <Icon className="w-3.5 h-3.5" />
                {getTypeLabel(event.type)}
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
              <span className="px-3 py-1 rounded-full bg-zinc-600/20 text-zinc-400 text-xs font-bold border border-zinc-600/30">
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

      {/* CONTENU SCROLLABLE */}
      <main className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 md:px-8 py-4 space-y-6 pb-6">
        
        {/* THEME */}
        {event.theme && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
            <p className="text-sm text-zinc-300">
              <span className="font-medium">Thème :</span> {event.theme}
            </p>
          </div>
        )}

        {/* DESCRIPTION AVEC BOUTON "VOIR PLUS" */}
        {event.description && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Description
            </h3>
            <p className={`text-zinc-300 text-sm leading-relaxed ${!showFullDescription && isDescriptionLong ? 'line-clamp-3' : ''}`}>
              {event.description}
            </p>
            {isDescriptionLong && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                {showFullDescription ? 'Voir moins' : 'Voir plus'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* OBJECTIFS */}
        {event.objectives && event.objectives.length > 0 && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Objectifs
            </h3>
            <div className="space-y-3">
              {event.objectives.map((obj) => {
                const current = event.userParticipation?.progress?.[obj.id] || 0;
                const objProgress = Math.min((current / obj.target) * 100, 100);

                return (
                  <div key={obj.id} className="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{obj.description}</span>
                      <span className="text-zinc-500 font-medium">
                        {current} / {obj.target}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          objProgress >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
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

        {/* PROGRESSION GLOBALE */}
        {isParticipating && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-blue-400" />
              Progression globale
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-white">
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
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              Récompenses
            </h3>
            <div className="flex flex-wrap gap-3">
              {event.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800/60 rounded-xl px-4 py-2.5"
                >
                  {reward.icon === "coins" && <Coins className="w-4 h-4 text-amber-400" />}
                  {reward.icon === "ticket" && <Ticket className="w-4 h-4 text-purple-400" />}
                  {reward.icon === "crown" && <Crown className="w-4 h-4 text-amber-400" />}
                  {reward.icon === "star" && <Star className="w-4 h-4 text-blue-400" />}
                  <span className="text-sm font-medium text-white">{reward.label}</span>
                  <span className="text-xs text-zinc-500">x{reward.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3 pb-4">
          {/* ✅ SOUMETTRE UNE ŒUVRE - CORRIGÉ */}
          {(isParticipating || event.type === "DESSIN" || event.type === "BATTLE" || event.type === "TOURNAMENT") && isActive && acceptsSubmissions && (
            <Link
              href={`/events/${event.id}/participate`}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Soumettre une œuvre
            </Link>
          )}

          {/* PARTICIPER */}
          {!isParticipating && isActive && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
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

          {/* RÉCLAMER LES RÉCOMPENSES */}
          {isParticipating && isCompleted && !rewardClaimed && (
            <button
              onClick={handleClaimReward}
              disabled={claiming}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2"
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

          {/* RÉCOMPENSES RÉCLAMÉES */}
          {isParticipating && rewardClaimed && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Récompenses réclamées
            </div>
          )}

          {/* ÉVÉNEMENT TERMINÉ */}
          {isPast && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/40 border border-zinc-700/30 text-zinc-400 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Événement terminé
            </div>
          )}

          {/* ÉVÉNEMENT À VENIR */}
          {isUpcoming && !isParticipating && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Débute le {formatDate(event.startDate)}
            </div>
          )}

          {/* Voir le classement */}
          <Link
            href={`/events/${event.id}/ranking`}
            className="px-6 py-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 text-zinc-300 text-sm font-medium transition-all flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Voir le classement
          </Link>
        </div>

        {/* ERREUR */}
        {error && (
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
