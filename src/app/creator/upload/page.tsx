"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Upload, X, Plus, Image as ImageIcon } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

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
  const handleCoverChange = (e: React.ChangeEvent<HTMLInput>) => {
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
  // SOUMISSION
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

      // 2. Upload de la couverture (si présente)
      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);

        await fetch(`${API_URL}/mangas/${mangaId}/cover`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
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
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-ink-bg/80 backdrop-blur-sm border-b border-ink-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/profile" className="text-ink-muted hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-white">Publier un manga</span>
          <div className="w-16" />
        </div>
      </header>

      {/* ===== FORMULAIRE ===== */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm text-center">
            ✅ Manga créé avec succès ! Redirection...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Titre */}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Titre *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre manga"
              className="w-full px-4 py-3 rounded-lg bg-ink-card border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre manga..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-ink-card border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none transition-colors resize-none"
            />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    genre.includes(g)
                      ? "bg-accent text-white"
                      : "bg-ink-card border border-ink-border text-ink-muted hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-ink-card border border-ink-border text-white focus:border-accent outline-none transition-colors"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Couverture */}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Couverture</label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                coverPreview
                  ? "border-accent/50"
                  : "border-ink-border hover:border-accent/50"
              }`}
            >
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Aperçu de la couverture"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon className="w-12 h-12 text-ink-muted/50 mx-auto mb-2" />
                  <p className="text-ink-muted text-sm">Cliquez ou glissez une image</p>
                  <p className="text-ink-muted/50 text-xs">PNG, JPG, WEBP — Max 5MB</p>
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

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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