"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const API_URL = "https://ink-backend.vercel.app";

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slbosebjvnotrifwhbrl.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYm9zZWJqdm5vdHJpZndoYnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjI5NTUsImV4cCI6MjA5ODgzODk1NX0.x7-IEmg4r4IY_bl2-uJZlEs9jsSCS5lnpnx9GycpYos"
);

export default function UploadMangaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Formulaire
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<string[]>([]);
  const [status, setStatus] = useState("ONGOING");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const genres = ["Action", "Romance", "Horreur", "Sci-Fi", "Mystère", "Aventure", "Comédie", "Drame", "Fantastique"];
  const statuses = [
    { value: "ONGOING", label: "En cours" },
    { value: "COMPLETED", label: "Terminé" },
    { value: "HIATUS", label: "En pause" },
  ];

  // ============================================
  // GESTION DE LA COUVERTURE
  // ============================================
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // GESTION DES GENRES
  // ============================================
  const toggleGenre = (g: string) => {
    setGenre((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  // ============================================
  // SOUMISSION (Flux direct Supabase)
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 1. Créer le manga
      const mangaRes = await fetch(`${API_URL}/mangas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          genre,
          status,
        }),
      });

      const mangaData = await mangaRes.json();

      if (!mangaRes.ok) {
        throw new Error(mangaData.message || "Erreur lors de la création du manga");
      }

      const mangaId = mangaData.id;

      // 2. Upload de la couverture (si présente) via le flux direct
      if (coverFile) {
        const urlRes = await fetch(`${API_URL}/mangas/${mangaId}/cover/upload-url`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!urlRes.ok) {
          throw new Error("Échec de l'obtention de l'URL d'upload pour la couverture");
        }

        const { key, path, token: uploadToken } = await urlRes.json();

        // Uploader directement vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("chapters")
          .uploadToSignedUrl(path, uploadToken, coverFile);

        if (uploadError) {
          throw new Error(`Échec de l'upload Supabase: ${uploadError.message}`);
        }

        // Finaliser l'enregistrement de la couverture
        const finalizeRes = await fetch(`${API_URL}/mangas/${mangaId}/cover/finalize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ key }),
        });

        if (!finalizeRes.ok) {
          console.warn("⚠️ La couverture n'a pas pu être finalisée, mais le manga est créé");
        }
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
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight">Publier un manga</span>
          <div className="w-12" />
        </div>
      </header>

      {/* ===== FORMULAIRE ===== */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-xl mx-auto w-full space-y-6">

        {/* ALERTES */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Manga créé avec succès ! Redirection...</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-lg space-y-5">
            
            {/* Titre */}
            <div>
              <label className="block text-zinc-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                Titre du Manga *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Solo Leveling, Chainsaw Man..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-zinc-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                Synopsis / Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'histoire de votre manga..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium resize-none"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-zinc-300 text-xs font-semibold mb-2.5 uppercase tracking-wider">
                Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => {
                  const isSelected = genre.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-zinc-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                Statut de parution
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value} className="bg-zinc-900 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Couverture */}
            <div>
              <label className="block text-zinc-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                Image de Couverture
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-zinc-900/50 ${
                  coverPreview
                    ? "border-blue-500/80 bg-blue-500/5"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {coverPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={coverPreview}
                      alt="Aperçu de la couverture"
                      className="max-h-56 rounded-xl shadow-xl border border-zinc-800 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
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
                  onChange={handleCoverChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-900/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Publier le manga
              </>
            )}
          </button>

        </form>
      </main>

      {/* ===== BOTTOM NAV ===== */}
      <BottomNav />

    </div>
  );
}
