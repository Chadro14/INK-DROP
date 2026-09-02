"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import {
  ArrowLeft,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Image,
  BookOpen,
  FileText,
  Sparkles,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Manga = {
  id: string;
  title: string;
  coverUrl: string | null;
};

type Chapter = {
  id: string;
  number: number;
  title: string | null;
};

export default function SubmitPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [eventTitle, setEventTitle] = useState("");
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Formulaire
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mangaId, setMangaId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Récupérer l'événement
        const eventRes = await fetch(`${API_URL}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!eventRes.ok) throw new Error("Événement non trouvé");
        const eventData = await eventRes.json();
        setEventTitle(eventData.data.title);

        // Vérifier que l'utilisateur participe
        if (!eventData.data.userParticipation) {
          setError("Vous devez participer à l'événement pour soumettre une œuvre");
          setLoading(false);
          return;
        }

        // Vérifier que l'événement accepte les soumissions
        const allowedTypes = ["BATTLE", "DESSIN", "TOURNAMENT"];
        if (!allowedTypes.includes(eventData.data.type)) {
          setError("Cet événement n'accepte pas de soumissions");
          setLoading(false);
          return;
        }

        // Récupérer les mangas de l'utilisateur
        const mangasRes = await fetch(`${API_URL}/users/me/mangas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mangasRes.ok) {
          const mangasData = await mangasRes.json();
          setMangas(mangasData.data || []);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (eventId) loadData();
  }, [eventId, router]);

  // Charger les chapitres quand un manga est sélectionné
  useEffect(() => {
    if (!mangaId) {
      setChapters([]);
      setChapterId("");
      return;
    }

    const loadChapters = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/mangas/${mangaId}/chapters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setChapters(data.data || []);
        }
      } catch (error) {
        console.error("Erreur chargement chapitres:", error);
      }
    };

    loadChapters();
  }, [mangaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Veuillez entrer un titre");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        mangaId: mangaId || undefined,
        chapterId: chapterId || undefined,
        imageUrl: imageUrl || undefined,
      };

      const res = await fetch(`${API_URL}/events/${eventId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la soumission");
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
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Erreur</h2>
        <p className="text-zinc-400 max-w-md">{error}</p>
        <Link
          href={`/events/${eventId}`}
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retour à l'événement
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Soumission réussie !</h2>
        <p className="text-zinc-400 max-w-md">
          Votre œuvre a été soumise avec succès. Vous serez notifié du résultat.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href={`/events/${eventId}`}
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
          >
            Retour à l'événement
          </Link>
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href={`/events/${eventId}`}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight truncate max-w-[150px]">
            Soumettre une œuvre
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 md:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* INFO ÉVÉNEMENT */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {eventTitle}
            </h2>
            <p className="text-zinc-400 text-xs mt-1">
              Soumettez votre œuvre pour participer à l'événement
            </p>
          </div>

          {/* TITRE */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Titre de l'œuvre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Mon chef-d'œuvre"
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
          </div>

          {/* MANGA / CHAPITRE */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Œuvre associée
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Manga
              </label>
              <select
                value={mangaId}
                onChange={(e) => setMangaId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              >
                <option value="">Aucun manga associé</option>
                {mangas.map((manga) => (
                  <option key={manga.id} value={manga.id}>
                    {manga.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Chapitre (optionnel)
              </label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                disabled={!mangaId}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Aucun chapitre</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    Chapitre {chapter.number}{chapter.title ? `: ${chapter.title}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* IMAGE */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-400" />
              Image (optionnel)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                URL de l'image
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* ERREUR */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* BOUTON SOUMISSION */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Soumettre l'œuvre
              </>
            )}
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
