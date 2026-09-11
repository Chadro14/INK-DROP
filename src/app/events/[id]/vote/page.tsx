"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Star,
  Users,
  Image as ImageIcon,
  Heart,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Event = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  theme: string | null;
  coverUrl: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  _count?: {
    participations: number;
    submissions: number;
  };
  userParticipation?: {
    id: string;
    isCompleted: boolean;
  };
  submissions?: Submission[];
};

type Submission = {
  id: string;
  userId: string;
  eventId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  score: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  manga?: {
    id: string;
    title: string;
    coverUrl: string | null;
  } | null;
};

// ============================================
// CONFIG PAR TYPE DE VOTE
// ============================================
type VoteMode = "UP_DOWN" | "STARS";

const getVoteMode = (type: string): VoteMode => {
  switch (type) {
    case "BATTLE":
    case "AWARDS":
      return "UP_DOWN";
    case "DESSIN":
      return "STARS";
    case "TOURNAMENT":
      return "UP_DOWN";
    default:
      return "UP_DOWN";
  }
};

const getVoteLabel = (type: string): string => {
  switch (type) {
    case "BATTLE":
      return "Voter pour ce manga";
    case "DESSIN":
      return "Noter ce dessin";
    case "AWARDS":
      return "Voter pour cette nomination";
    case "TOURNAMENT":
      return "Voter pour ce participant";
    default:
      return "Voter";
  }
};

export default function EventVotePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [voting, setVoting] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ============================================
  // CHARGEMENT
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Récupérer l'utilisateur
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            const parsed = JSON.parse(userData);
            setCurrentUserId(parsed?.id || null);
          }
        } catch {}

        // Charger l'événement avec les soumissions
        const res = await fetch(`${API_URL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Événement non trouvé");

        const data = await res.json();
        setEvent(data.data);
        setSubmissions(data.data.submissions || []);

        // Vérifier les votes de l'utilisateur
        // (optionnel — on pourrait ajouter un endpoint pour ça)
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId, router]);

  // ============================================
  // VOTER
  // ============================================
  const handleVote = async (submissionId: string, voteType: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setVoting(submissionId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/events/${eventId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submissionId,
          voteType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du vote");
      }

      // Mettre à jour le score
      setSubmissions((prev) =>
        prev.map((sub) => {
          if (sub.id !== submissionId) return sub;

          let scoreChange = 0;
          if (voteType === "UP") scoreChange = 1;
          else if (voteType === "DOWN") scoreChange = -1;
          else if (voteType.startsWith("STAR_")) {
            scoreChange = parseInt(voteType.split("_")[1]);
          }

          return { ...sub, score: sub.score + scoreChange };
        })
      );

      setUserVotes((prev) => ({ ...prev, [submissionId]: true }));
      setSuccess("Vote enregistré !");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVoting(null);
    }
  };

  // ============================================
  // RENDU
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

  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const isActive = event.isActive && start <= now && end >= now;
  const isParticipating = !!event.userParticipation;
  const voteMode = getVoteMode(event.type);

  // Pas inscrit
  if (!isParticipating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-950/30 border border-blue-500/30 flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Vous ne participez pas</h2>
        <p className="text-muted-foreground max-w-md">
          Vous devez participer à l'événement pour voter.
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

  // Event terminé
  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Événement terminé</h2>
        <p className="text-muted-foreground max-w-md">
          Vous ne pouvez plus voter.
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
          <span className="text-base font-bold tracking-tight truncate max-w-[180px]">
            Voter
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">
        {/* INFO ÉVÉNEMENT */}
        <div className="bg-card/40 border border-border/80 rounded-2xl p-5">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            {event.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {submissions.length} soumission{submissions.length > 1 ? "s" : ""} à
            voter
          </p>
        </div>

        {/* SUCCÈS */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ERREUR */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LISTE DES SOUMISSIONS */}
        {submissions.length === 0 ? (
          <div className="text-center py-16 bg-card/30 rounded-2xl border border-border/40">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              Aucune soumission pour le moment
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Les votes seront disponibles quand des œuvres seront soumises.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((submission) => {
              const isOwnSubmission = submission.userId === currentUserId;
              const hasVoted = userVotes[submission.id];
              const isVoting = voting === submission.id;

              return (
                <div
                  key={submission.id}
                  className="bg-card/40 border border-border/80 rounded-2xl overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                    {submission.imageUrl ? (
                      <img
                        src={submission.imageUrl}
                        alt={submission.title}
                        className="w-full h-full object-cover"
                      />
                    ) : submission.manga?.coverUrl ? (
                      <img
                        src={submission.manga.coverUrl}
                        alt={submission.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                    )}

                    {/* Score badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span className="text-xs font-bold text-foreground">
                        {submission.score}
                      </span>
                    </div>

                    {/* Own submission badge */}
                    {isOwnSubmission && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold">
                        Votre œuvre
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-1">
                        {submission.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        par @{submission.user.username}
                      </p>
                    </div>

                    {submission.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {submission.description}
                      </p>
                    )}

                    {/* Boutons de vote */}
                    {isOwnSubmission ? (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        Vous ne pouvez pas voter pour votre propre œuvre
                      </div>
                    ) : hasVoted ? (
                      <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Vote enregistré
                      </div>
                    ) : voteMode === "UP_DOWN" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVote(submission.id, "UP")}
                          disabled={isVoting}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isVoting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <ThumbsUp className="w-4 h-4" />
                              Voter
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleVote(submission.id, "DOWN")}
                          disabled={isVoting}
                          className="py-2.5 px-4 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-rose-500/50 text-sm font-medium transition-all disabled:opacity-50"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() =>
                              handleVote(submission.id, `STAR_${star}`)
                            }
                            disabled={isVoting}
                            className="p-2 rounded-lg hover:bg-card transition-all disabled:opacity-50 group"
                            title={`${star} étoile${star > 1 ? "s" : ""}`}
                          >
                            <Star className="w-6 h-6 text-amber-400 hover:fill-amber-400 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
