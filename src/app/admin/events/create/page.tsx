"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  X,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

const EVENT_TYPES = [
  { value: "BATTLE", label: "⚔️ Battle de mangas" },
  { value: "DESSIN", label: "🎨 Défi Dessin" },
  { value: "TICKETS", label: "🎟️ Semaine des Tickets" },
  { value: "RISING_CREATOR", label: "🚀 Rising Creator" },
  { value: "AWARDS", label: "👑 INKDROP Awards" },
  { value: "TOURNAMENT", label: "💥 INKDROP Tournament" },
];

const REWARD_TYPES = [
  { value: "MANAS", label: "MANAS" },
  { value: "TICKET", label: "Ticket" },
  { value: "CROWN", label: "Couronne" },
  { value: "STAR", label: "Étoile" },
];

const REWARD_ICONS = [
  { value: "coins", label: "🪙 Coins" },
  { value: "ticket", label: "🎟️ Ticket" },
  { value: "crown", label: "👑 Crown" },
  { value: "star", label: "⭐ Star" },
];

export default function AdminEventCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Formulaire
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [icon, setIcon] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(999999);

  // Récompenses
  const [rewards, setRewards] = useState<
    { type: string; value: number; label: string; icon: string }[]
  >([]);
  const [rewardType, setRewardType] = useState("MANAS");
  const [rewardValue, setRewardValue] = useState(100);
  const [rewardLabel, setRewardLabel] = useState("");
  const [rewardIcon, setRewardIcon] = useState("coins");

  // Objectifs
  const [objectives, setObjectives] = useState<
    { description: string; target: number }[]
  >([]);
  const [objectiveDescription, setObjectiveDescription] = useState("");
  const [objectiveTarget, setObjectiveTarget] = useState(10);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Non authentifié");

        const data = await res.json();

        if (data.role !== "ADMIN") {
          setError("Accès réservé aux administrateurs");
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const addReward = () => {
    if (!rewardLabel) {
      setError("Veuillez entrer un nom pour la récompense");
      return;
    }
    if (rewardValue <= 0) {
      setError("La valeur doit être positive");
      return;
    }

    setRewards([
      ...rewards,
      {
        type: rewardType,
        value: rewardValue,
        label: rewardLabel,
        icon: rewardIcon,
      },
    ]);

    // Réinitialiser
    setRewardLabel("");
    setRewardValue(100);
  };

  const removeReward = (index: number) => {
    setRewards((prev) => prev.filter((_, i) => i !== index));
  };

  const addObjective = () => {
    if (!objectiveDescription) {
      setError("Veuillez entrer une description pour l'objectif");
      return;
    }
    if (objectiveTarget <= 0) {
      setError("La cible doit être positive");
      return;
    }

    setObjectives([
      ...objectives,
      {
        description: objectiveDescription,
        target: objectiveTarget,
      },
    ]);

    setObjectiveDescription("");
    setObjectiveTarget(10);
  };

  const removeObjective = (index: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Validations
    if (!type) {
      setError("Veuillez sélectionner un type d'événement");
      setLoading(false);
      return;
    }
    if (!title.trim()) {
      setError("Veuillez entrer un titre");
      setLoading(false);
      return;
    }
    if (!startDate || !endDate) {
      setError("Veuillez sélectionner les dates");
      setLoading(false);
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError("La date de fin doit être après la date de début");
      setLoading(false);
      return;
    }
    if (rewards.length === 0) {
      setError("Ajoutez au moins une récompense");
      setLoading(false);
      return;
    }
    if (objectives.length === 0) {
      setError("Ajoutez au moins un objectif");
      setLoading(false);
      return;
    }

    try {
      // ✅ CORRECTION 1 : Convertir les dates en ISO-8601
      const startDateISO = new Date(startDate).toISOString();
      const endDateISO = new Date(endDate).toISOString();

      // ✅ CORRECTION 2 : URL correcte (/events)
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          title,
          description: description || undefined,
          theme: theme || undefined,
          icon: icon || undefined,
          coverUrl: coverUrl || undefined,
          startDate: startDateISO,
          endDate: endDateISO,
          config: { maxParticipants },
          rewards,
          objectives,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création");
      }

      setMessage("✅ Événement créé avec succès !");
      setTimeout(() => {
        router.push("/admin/events");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center text-white space-y-4">
        <div className="p-3.5 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-400 shadow-xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-zinc-400 text-sm max-w-xs">{error}</p>
        <Link
          href="/profile"
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-10">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href="/admin/events"
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            Créer un événement
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 md:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* ALERTES */}
          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* INFORMATIONS GÉNÉRALES */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Informations générales
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Type d'événement *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                required
              >
                <option value="">Sélectionner un type</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Grand Battle de l'été"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'événement..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Thème
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Guerre des clans"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Icône
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Ex: trophy, crown, star..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Image de couverture (URL)
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* DATES */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Dates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Date de début *
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Participants maximum
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 999999)}
                min="1"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Laissez 999999 pour illimité
              </p>
            </div>
          </div>

          {/* RÉCOMPENSES */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Récompenses *
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Type
                </label>
                <select
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 outline-none transition-all text-sm"
                >
                  {REWARD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Valeur
                </label>
                <input
                  type="number"
                  value={rewardValue}
                  onChange={(e) => setRewardValue(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={rewardLabel}
                  onChange={(e) => setRewardLabel(e.target.value)}
                  placeholder="Ex: 100 MANAS"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Icône
                </label>
                <select
                  value={rewardIcon}
                  onChange={(e) => setRewardIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 outline-none transition-all text-sm"
                >
                  {REWARD_ICONS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={addReward}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter la récompense
            </button>

            {rewards.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {rewards.map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800/60 rounded-xl px-3 py-2"
                  >
                    <span className="text-xs">
                      {reward.icon === "coins" && "🪙"}
                      {reward.icon === "ticket" && "🎟️"}
                      {reward.icon === "crown" && "👑"}
                      {reward.icon === "star" && "⭐"}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {reward.label}
                    </span>
                    <span className="text-xs text-zinc-500">x{reward.value}</span>
                    <button
                      type="button"
                      onClick={() => removeReward(index)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OBJECTIFS */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Objectifs *
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={objectiveDescription}
                  onChange={(e) => setObjectiveDescription(e.target.value)}
                  placeholder="Ex: Lire 10 chapitres"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cible
                </label>
                <input
                  type="number"
                  value={objectiveTarget}
                  onChange={(e) => setObjectiveTarget(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addObjective}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter l'objectif
            </button>

            {objectives.length > 0 && (
              <div className="space-y-2 mt-2">
                {objectives.map((obj, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800/60 rounded-xl px-3 py-2"
                  >
                    <span className="text-sm text-white">{obj.description}</span>
                    <span className="text-xs text-zinc-500">Cible: {obj.target}</span>
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOUTON SOUMISSION */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Créer l'événement
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
