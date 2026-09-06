"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  X,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function CreateMangaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("ONGOING");

  const genres = [
    "Action", "Aventure", "Comédie", "Drame", "Fantastique",
    "Horreur", "Mystère", "Romance", "Science-fiction", "Surnaturel",
    "Tranche de vie", "Thriller"
  ];

  // ✅ Upload de la couverture APRÈS la création du manga
  const uploadCover = async (mangaId: string, file: File): Promise<string | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/mangas/${mangaId}/cover/upload-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur upload couverture");
      }

      const data = await res.json();
      return data.data?.coverUrl || data.coverUrl;
    } catch (error: any) {
      console.error("❌ Erreur upload couverture:", error.message);
      return null;
    }
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
      setError("Veuillez entrer un titre");
      return;
    }

    setLoading(true);

    try {
      // 1. Créer le manga SANS couverture
      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        genre: genre ? [genre] : [],
        status,
      };

      const res = await fetch(`${API_URL}/mangas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création");
      }

      const mangaId = data.data.id;

      // 2. Uploader la couverture si présente
      if (coverFile) {
        await uploadCover(mangaId, coverFile);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/manga/${mangaId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground">

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/creator/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Nouveau manga
          </span>
          <div className="w-12" />
        </div>
      </header>

      <div className="h-24 w-full bg-gradient-to-r from-background via-blue-950/40 to-background border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      <main className="max-w-2xl mx-auto w-full px-4 -mt-10 flex-1">

        <form onSubmit={handleSubmit} className="bg-card/40 border border-border/80 rounded-2xl p-6 space-y-6">

          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Manga créé ! Redirection...</span>
            </div>
          )}

          {/* TITRE */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre manga"
              className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm"
              maxLength={60}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre manga..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* COUVERTURE */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Couverture
            </label>
            {coverPreview ? (
              <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-border/80 group">
                <img
                  src={coverPreview}
                  alt="Couverture"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-blue-500/50 rounded-xl cursor-pointer bg-card/30 hover:bg-card/50 transition-all group">
                <div className="p-3 rounded-full bg-card border border-border group-hover:border-blue-500/30 text-blue-400 mb-2 transition-all">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-foreground">Ajouter une couverture</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Max 2MB</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                  La couverture sera ajoutée après la création du manga
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverFile(file);
                      setCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* GENRE */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground focus:border-blue-500 outline-none transition-all text-sm"
            >
              <option value="">Sélectionner un genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* STATUT */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Statut
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "ONGOING", label: "En cours" },
                { value: "COMPLETED", label: "Terminé" },
                { value: "HIATUS", label: "En pause" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    status === s.value
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-card/90 text-muted-foreground border-border hover:border-border/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* BOUTON */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Créer le manga
              </>
            )}
          </button>
        </form>

      </main>

      <BottomNav />
    </div>
  );
}
