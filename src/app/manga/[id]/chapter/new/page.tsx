"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import {
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Plus,
  X,
  BookOpen,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function ChapterUploadPage() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params?.mangaId as string;

  // États du formulaire
  const [mode, setMode] = useState<"images" | "pdf">("images");
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Gestion de la sélection d'images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setPhotoFiles((prev) => [...prev, ...selected]);
    }
  };

  // Suppression d'une image sélectionnée
  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!number || isNaN(parseInt(number, 10))) {
      setError("Veuillez entrer un numéro de chapitre valide.");
      return;
    }

    const filesToUpload = mode === "pdf" ? (pdfFile ? [pdfFile] : []) : photoFiles;
    if (filesToUpload.length === 0) {
      setError(
        mode === "pdf"
          ? "Veuillez sélectionner un fichier PDF."
          : "Veuillez sélectionner au moins une image."
      );
      return;
    }

    try {
      setLoading(true);

      // ===== ÉTAPE 1 : Demander les URLs d'upload au backend =====
      setProgress("Préparation de l'upload...");

      // Extraction des noms de fichiers
      const filenames = filesToUpload.map((file) => file.name);

      // ✅ CORRECTION : Envoi de `filenames` au backend
      const urlRes = await fetch(`${API_URL}/mangas/${mangaId}/chapters/upload-urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filenames,
          mode,
          chapterNumber: parseInt(number, 10),
          title: title.trim() || undefined,
        }),
      });

      if (!urlRes.ok) {
        const errorData = await urlRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la préparation de l'upload.");
      }

      const { uploadUrls, chapterId } = await urlRes.json();

      // ===== ÉTAPE 2 : Upload des fichiers vers les URLs signées Supabase =====
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const targetUrl = Array.isArray(uploadUrls) ? uploadUrls[i] : uploadUrls;

        setProgress(`Upload de ${i + 1}/${filesToUpload.length} : ${file.name}`);

        const uploadRes = await fetch(targetUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error(`Échec de l'upload du fichier ${file.name}`);
        }
      }

      // ===== ÉTAPE 3 : Finalisation =====
      setProgress("Finalisation du chapitre...");
      setSuccess(true);
      setTimeout(() => {
        router.push(`/manga/${mangaId}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'upload.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">
      
      {/* HEADER FIXE MINIMALISTE */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90">
            Nouveau Chapitre
          </span>
          <div className="w-9" /> {/* Spacer équilibré */}
        </div>
      </header>

      {/* BANNIÈRE SUPÉRIEURE DÉCORATIVE */}
      <div className="h-24 md:h-32 w-full bg-gradient-to-r from-zinc-950 via-blue-950/30 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      {/* CONTENU PRINCIPAL CENTRÉ */}
      <main className="max-w-2xl mx-auto w-full px-4 md:px-8 -mt-10 flex flex-col gap-6">

        {/* CARTE FORMULAIRE */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 md:p-7 backdrop-blur-md shadow-xl space-y-6">
          
          {/* SÉLECTEUR DE MODE (IMAGES OU PDF) */}
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Format d'importation
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setMode("images")}
                className={`py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === "images"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Images (PNG/JPG)
              </button>
              <button
                type="button"
                onClick={() => setMode("pdf")}
                className={`py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === "pdf"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                Document PDF
              </button>
            </div>
          </div>

          {/* INFORMATIONS DU CHAPITRE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs md:text-sm font-bold text-zinc-300">
                N° Chapitre <span className="text-blue-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 1"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs md:text-sm font-bold text-zinc-300">
                Titre du chapitre <span className="text-zinc-500 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Le Début d'une Aventure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* SÉLECTION DES FICHIERS */}
          <div className="space-y-3">
            <label className="text-xs md:text-sm font-bold text-zinc-300 flex items-center justify-between">
              <span>Contenu du chapitre <span className="text-blue-400">*</span></span>
              {mode === "images" && photoFiles.length > 0 && (
                <span className="text-xs text-blue-400 font-semibold">
                  {photoFiles.length} page(s) ajoutée(s)
                </span>
              )}
            </label>

            {mode === "images" ? (
              <div className="space-y-4">
                {/* Zone de drop/sélection */}
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 hover:border-blue-500/50 rounded-2xl cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/40 transition-all group">
                  <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-blue-500/30 text-blue-400 mb-2 transition-all">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-xs md:text-sm font-bold text-white">Sélectionner des images</p>
                  <p className="text-[11px] text-zinc-500 mt-1">PNG, JPG, WEBP • Glisser plusieurs pages</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Prévisualisation des images */}
                {photoFiles.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-zinc-950/60 rounded-xl border border-zinc-800/60">
                    {photoFiles.map((file, idx) => (
                      <div key={idx} className="relative aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden group border border-zinc-800">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Page ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Sélection PDF */
              <div>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 hover:border-blue-500/50 rounded-2xl cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/40 transition-all group">
                  <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-blue-500/30 text-blue-400 mb-2 transition-all">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-xs md:text-sm font-bold text-white">
                    {pdfFile ? pdfFile.name : "Sélectionner un fichier PDF"}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Un fichier PDF contenant tout le chapitre</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* ALERTE ERREUR */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs md:text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ALERTE SUCCÈS */}
          {success && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs md:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Chapitre publié avec succès ! Redirection en cours...</span>
            </div>
          )}

          {/* BOUTON D'ACTION & PROGRESSION */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progress || "Traitement en cours..."}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publier le Chapitre</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
