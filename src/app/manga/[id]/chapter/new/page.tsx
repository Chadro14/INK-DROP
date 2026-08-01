"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-client";

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
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      // ===== ÉTAPE 1 : demander les URLs d'upload signées =====
      setProgress("Préparation de l'upload...");
      const count = mode === "pdf" ? 1 : photoFiles.length;

      const urlRes = await fetch(`${API_URL}/mangas/${mangaId}/chapters/upload-urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode,
          count,
          chapterNumber: parseInt(number, 10),
        }),
      });

      const urlData = await urlRes.json();
      if (!urlRes.ok) {
        throw new Error(urlData.message || "Erreur lors de la préparation de l'upload");
      }

      const uploadTargets: { key: string; path: string; token: string }[] = urlData.files;

      // ===== ÉTAPE 2 : uploader directement vers Supabase =====
      const filesToUpload = mode === "pdf" ? [pdfFile!] : photoFiles;

      for (let i = 0; i < uploadTargets.length; i++) {
        setProgress(`Envoi du fichier ${i + 1}/${uploadTargets.length}...`);
        const target = uploadTargets[i];
        const file = filesToUpload[i];

        const { error: uploadError } = await supabaseClient.storage
          .from("chapters")
          .uploadToSignedUrl(target.path, target.token, file);

        if (uploadError) {
          throw new Error(`Échec de l'envoi du fichier ${i + 1} : ${uploadError.message}`);
        }
      }

      // ===== ÉTAPE 3 : finaliser le chapitre (métadonnées uniquement) =====
      setProgress("Finalisation...");
      const keys = uploadTargets.map((t) => t.key);

      const finalizeRes = await fetch(`${API_URL}/mangas/${mangaId}/chapters/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode,
          keys,
          number: parseInt(number, 10),
          title: title.trim() || undefined,
          price: price.trim() ? parseFloat(price) : undefined,
          isDraft,
          freePageIndexes: mode === "photos" ? JSON.stringify(Array.from(freeIndexes)) : undefined,
        }),
      });

      const finalizeData = await finalizeRes.json();
      if (!finalizeRes.ok) {
        throw new Error(finalizeData.message || "Erreur lors de la création du chapitre");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/manga/${mangaId}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">

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

        {loading && progress && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm text-center">
            {progress}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

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
