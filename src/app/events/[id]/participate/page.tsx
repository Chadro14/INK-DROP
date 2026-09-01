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
  Image as ImageIcon,
  X,
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

export default function EventParticipatePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Formulaire de soumission
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Veuillez entrer un titre pour votre soumission");
      return;
    }

    if (!imageFile) {
      setError("Veuillez sélectionner une image");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload de l'image
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url || uploadData.data?.url;

      // 2. Soumettre au backend
      const submitRes = await fetch(`${API_URL}/events/${eventId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          imageUrl,
        }),
      });

      const submitData = await submitRes.json();

      if (!submitRes.ok) {
        throw new Error(submitData.message || "Erreur lors de la soumission");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/events/${eventId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const isActive = event.isActive && start <= now && end >= now;
  const isParticipating = !!event.userParticipation;

  // Vérifier si l'utilisateur participe
  if (!isParticipating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-950/30 border border-amber-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Vous ne participez pas</h2>
        <p className="text-zinc-400 max-w-md">
          Vous devez d'abord participer à l'événement pour soumettre une œuvre.
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

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Événement terminé</h2>
        <p className="text-zinc-400 max-w-md">
          Cet événement est terminé. Vous ne pouvez plus soumettre d'œuvre.
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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link href={`/events/${eventId}`} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight truncate max-w-[150px]">
            Soumettre
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 md:px-8 py-6 flex flex-col gap-6">

        {/* INFO ÉVÉNEMENT */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            {event.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
          </p>
          {event.theme && (
            <p className="text-xs text-blue-400 mt-1">
              Thème : {event.theme}
            </p>
          )}
        </div>

        {/* SUCCÈS */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Œuvre soumise avec succès ! Redirection...</span>
          </div>
        )}

        {/* ERREUR */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Titre de l'œuvre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mon dessin pour le défi"
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
              placeholder="Décrivez votre œuvre..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Image de l'œuvre *
            </label>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-zinc-950/50 ${
                imagePreview
                  ? "border-blue-500/80 bg-blue-500/5"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="max-h-64 rounded-xl shadow-xl border border-zinc-800 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-300 text-sm font-medium mb-1">
                    Cliquez ou glissez une image
                  </p>
                  <p className="text-zinc-500 text-xs">
                    PNG, JPG, WEBP — Max 5MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || success || !title.trim() || !imageFile}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Soumission en cours...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Soumettre mon œuvre
              </>
            )}
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
