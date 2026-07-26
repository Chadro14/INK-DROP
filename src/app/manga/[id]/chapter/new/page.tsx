"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, FileText, Image as ImageIcon } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function NewChapterPage() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params.id as string;

  const [mode, setMode] = useState<"pdf" | "photos">("pdf");
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [freeIndexes, setFreeIndexes] = useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ============================================
  // GESTION DES FICHIERS
  // ============================================
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPdfFile(file);
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setFreeIndexes((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const toggleFree = (index: number) => {
    setFreeIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // ============================================
  // SOUMISSION
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!number.trim()) {
      setError("Le numéro du chapitre est requis");
      return;
    }
    if (mode === "pdf" && !pdfFile) {
      setError("Sélectionnez un fichier PDF");
      return;
    }
    if (mode === "photos" && photoFiles.length === 0) {
      setError("Sélectionnez au moins une photo");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("number", number);
      if (title.trim()) formData.append("title", title);
      if (price.trim()) formData.append("price", price);
      formData.append("isDraft", String(isDraft));

      if (mode === "pdf" && pdfFile) {
        formData.append("pdf", pdfFile);
      } else {
        photoFiles.forEach((file) => formData.append("photos", file));
        formData.append("freePageIndexes", JSON.stringify(Array.from(freeIndexes)));
      }

      const res = await fetch(`${API_URL}/mangas/${mangaId}/chapters`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout du chapitre");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/manga/${mangaId}`);
      }, 1200);
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
          <Link href={`/manga/${mangaId}`} className="text-ink-muted hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-white">Ajouter un chapitre</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm text-center">
            ✅ Chapitre ajouté ! Redirection...
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Choix du mode */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("pdf")}
              className={`py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                mode === "pdf" ? "bg-accent text-white" : "bg-ink-card border border-ink-border text-ink-muted"
              }`}
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button
              type="button"
              onClick={() => setMode("photos")}
              className={`py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                mode === "photos" ? "bg-accent text-white" : "bg-ink-card border border-ink-border text-ink-muted"
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Photos
            </button>
          </div>

          {/* Numéro du chapitre */}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Numéro du chapitre *</label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-3 rounded-lg bg-ink-card border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none"
              required
            />
          </div>

          {/* Titre */}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Titre (optionnel)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du chapitre"
              className="w-full px-4 py-3 rounded-lg bg-ink-card border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none"
            />
          </div>

          {/* MODE PDF */}
          {mode === "pdf" && (
            <div>
              <label className="block text-ink-muted text-sm font-medium mb-1">Fichier PDF *</label>
              <div className="relative border-2 border-dashed border-ink-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
                {pdfFile ? (
                  <p className="text-white text-sm">{pdfFile.name}</p>
                ) : (
                  <>
                    <FileText className="w-10 h-10 text-ink-muted/50 mx-auto mb-2" />
                    <p className="text-ink-muted text-sm">Cliquez pour choisir un PDF</p>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* MODE PHOTOS */}
          {mode === "photos" && (
            <div>
              <label className="block text-ink-muted text-sm font-medium mb-1">
                Photos * ({photoFiles.length} sélectionnée{photoFiles.length > 1 ? "s" : ""})
              </label>
              <div className="relative border-2 border-dashed border-ink-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors mb-3">
                <ImageIcon className="w-10 h-10 text-ink-muted/50 mx-auto mb-2" />
                <p className="text-ink-muted text-sm">Ajouter des photos (une ou plusieurs)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotosChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {photoFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoFiles.map((file, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-ink-border">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Page ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFree(index)}
                        className={`absolute bottom-1 left-1 right-1 py-1 rounded text-[10px] font-medium ${
                          freeIndexes.has(index) ? "bg-green-500 text-white" : "bg-black/60 text-ink-muted"
                        }`}
                      >
                        {freeIndexes.has(index) ? "Gratuite" : "Payante"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prix */}
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Prix (USD, optionnel)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.99"
              className="w-full px-4 py-3 rounded-lg bg-ink-card border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none"
            />
          </div>

          {/* Brouillon */}
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="w-4 h-4"
            />
            Enregistrer comme brouillon (non publié)
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" /> Publier le chapitre
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}