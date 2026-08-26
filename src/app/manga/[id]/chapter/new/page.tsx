"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Lock,
  Coins,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function ChapterUploadPage() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params?.id as string;

  const [mode, setMode] = useState<"images" | "pdf">("images");
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ✅ ÉTATS POUR LE CHAPITRE PAYANT
  const [totalChapters, setTotalChapters] = useState(0);
  const [isPaidChapter, setIsPaidChapter] = useState(false);
  const [canBePaid, setCanBePaid] = useState(false);
  const [paidPages, setPaidPages] = useState<number[]>([]);

  // ✅ RÉCUPÉRER LE NOMBRE TOTAL DE CHAPITRES
  useEffect(() => {
    const fetchTotalChapters = async () => {
      try {
        const res = await fetch(`${API_URL}/mangas/${mangaId}/chapters`);
        if (res.ok) {
          const data = await res.json();
          setTotalChapters(data.length || 0);
        }
      } catch (error) {
        console.error("Erreur récupération chapitres:", error);
      }
    };

    if (mangaId) {
      fetchTotalChapters();
    }
  }, [mangaId]);

  // ✅ VÉRIFIER SI LE CHAPITRE PEUT ÊTRE PAYANT
  useEffect(() => {
    const num = parseInt(number);
    if (!isNaN(num) && totalChapters >= 10 && num === totalChapters) {
      setCanBePaid(true);
    } else {
      setCanBePaid(false);
      setIsPaidChapter(false);
    }
  }, [number, totalChapters]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setPhotoFiles((prev) => [...prev, ...selected]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ TOGGLE POUR MARQUER UNE PAGE COMME PAYANTE
  const togglePagePaid = (index: number) => {
    setPaidPages((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const getMimeType = (file: File): string => {
    if (file.type && file.type !== "") {
      return file.type;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'pdf': 'application/pdf',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
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

    const chapterNum = parseInt(number, 10);
    if (!number || isNaN(chapterNum)) {
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
      setProgress("Obtention des liens de stockage...");

      const filenames = filesToUpload.map((file) => file.name);

      const urlRes = await fetch(`${API_URL}/mangas/${mangaId}/chapters/upload-urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filenames }),
      });

      if (!urlRes.ok) {
        const errorData = await urlRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la préparation de l'upload.");
      }

      const responseData = await urlRes.json();
      console.log('📦 Réponse de upload-urls:', responseData);

      let uploadUrls: string[] = [];
      let keys: string[] = [];

      if (Array.isArray(responseData)) {
        uploadUrls = responseData.map((item: any) => item.uploadUrl || item);
        keys = responseData.map((item: any) => item.key || item);
      } else if (responseData.files && Array.isArray(responseData.files)) {
        uploadUrls = responseData.files.map((file: any) => file.uploadUrl || file.signedUrl);
        keys = responseData.files.map((file: any) => file.key || file.path);
      } else {
        uploadUrls = responseData.uploadUrls || responseData.urls || [responseData.uploadUrl];
        keys = responseData.keys || responseData.fileKeys || [];
      }

      console.log('🔑 Clés extraites:', keys);
      console.log('📤 URLs d\'upload:', uploadUrls);

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const targetUrl = uploadUrls[i] || uploadUrls[0];

        setProgress(`Upload vers Supabase (${i + 1}/${filesToUpload.length}) : ${file.name}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        try {
          const uploadRes = await fetch(targetUrl, {
            method: "PUT",
            headers: { "Content-Type": getMimeType(file) },
            body: file,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!uploadRes.ok) {
            throw new Error(`Échec du transfert vers Supabase pour le fichier : ${file.name}`);
          }
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (err.name === "AbortError") {
            throw new Error(`Le fichier ${file.name} a pris trop de temps à uploader (timeout)`);
          }
          throw err;
        }
      }

      if (keys.length === 0) {
        throw new Error("Aucune clé de fichier reçue du backend. Vérifie la réponse de upload-urls.");
      }

      setProgress("Enregistrement du chapitre en base de données...");

      // ✅ CONSTRUCTION DU BODY AVEC FREE PAGE INDEXES
      const finalizeBody: any = {
        number: chapterNum,
        title: title.trim() || undefined,
        keys: keys,
        mode: mode === "images" ? "PHOTOS" : "PDF",
        isDraft: false,
      };

      // ✅ AJOUTER LES PAGES PAYANTES SI LE CHAPITRE EST PAYANT
      if (isPaidChapter && mode === "images" && paidPages.length > 0) {
        finalizeBody.freePageIndexes = JSON.stringify(
          keys.map((_, index) => !paidPages.includes(index))
        );
      }

      const finalizeRes = await fetch(`${API_URL}/mangas/${mangaId}/chapters/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalizeBody),
      });

      if (!finalizeRes.ok) {
        const finalizeErr = await finalizeRes.json().catch(() => ({}));
        throw new Error(finalizeErr.message || "Erreur lors de la création du chapitre en base de données.");
      }

      const finalizeData = await finalizeRes.json();
      console.log('📦 Réponse de finalize:', finalizeData);

      setProgress("Finalisation...");
      setSuccess(true);

      router.refresh();

      setTimeout(() => {
        router.push(`/manga/${mangaId}`);
      }, 1200);

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || "Une erreur est survenue lors de l'upload.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  // ✅ VÉRIFIER SI LE CHAPITRE EST LE DERNIER (ET >= 10)
  const chapterNum = parseInt(number);
  const isLastChapter = !isNaN(chapterNum) && totalChapters >= 10 && chapterNum === totalChapters;

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90">
            Nouveau Chapitre
          </span>
          <div className="w-9" />
        </div>
      </header>

      <div className="h-24 md:h-32 w-full bg-gradient-to-r from-zinc-950 via-blue-950/30 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      </div>

      <main className="max-w-2xl mx-auto w-full px-4 md:px-8 -mt-10 flex flex-col gap-6">

        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 md:p-7 backdrop-blur-md shadow-xl space-y-6">

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
              {totalChapters > 0 && (
                <p className="text-[10px] text-zinc-500">
                  Total : {totalChapters} chapitres
                  {totalChapters >= 10 && (
                    <span className="text-amber-400 ml-1">(Le chapitre {totalChapters} peut être payant)</span>
                  )}
                </p>
              )}
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

          {/* ✅ SECTION CHAPITRE PAYANT */}
          {mode === "images" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <label className="text-xs md:text-sm font-bold text-zinc-300">
                  Pages payantes
                </label>
              </div>

              {isLastChapter ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIsPaidChapter(!isPaidChapter)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        isPaidChapter
                          ? "bg-amber-600 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {isPaidChapter ? "🔒 Payant" : "🆓 Gratuit"}
                    </button>
                    <span className="text-xs text-zinc-500">
                      {isPaidChapter
                        ? "Les lecteurs paieront 50 MANAS pour ce chapitre"
                        : "Chapitre gratuit pour tous"}
                    </span>
                  </div>

                  {isPaidChapter && photoFiles.length > 0 && (
                    <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
                      <p className="text-xs text-zinc-400 mb-2">Sélectionnez les pages payantes :</p>
                      <div className="flex flex-wrap gap-2">
                        {photoFiles.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => togglePagePaid(index)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              paidPages.includes(index)
                                ? "bg-amber-600 text-white"
                                : "bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            Page {index + 1}
                            {paidPages.includes(index) && " 🔒"}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2">
                        {paidPages.length} page(s) payante(s) • Chaque page payante coûte 0.55$ aux lecteurs
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">
                      {totalChapters < 10
                        ? "Les 10 premiers chapitres sont gratuits"
                        : "Seul le dernier chapitre peut être payant"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "pdf" && (
            <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center gap-2 text-zinc-500">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">
                  Les PDF sont automatiquement payants si le chapitre est le dernier (≥ 10 chapitres)
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs md:text-sm font-bold text-zinc-300 flex items-center justify-between">
              <span>Contenu du chapitre <span className="text-blue-400">*</span></span>
              {mode === "images" && photoFiles.length > 0 && (
                <span className="text-xs text-blue-400 font-semibold">
                  {photoFiles.length} page(s) sélectionnée(s)
                </span>
              )}
            </label>

            {mode === "images" ? (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 hover:border-blue-500/50 rounded-2xl cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/40 transition-all group">
                  <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-blue-500/30 text-blue-400 mb-2 transition-all">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-xs md:text-sm font-bold text-white">Sélectionner les pages</p>
                  <p className="text-[11px] text-zinc-500 mt-1">PNG, JPG, WEBP • Sélection multiple acceptée</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

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
                          {isPaidChapter && paidPages.includes(idx) && " 🔒"}
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
              <div>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 hover:border-blue-500/50 rounded-2xl cursor-pointer bg-zinc-950/40 hover:bg-zinc-900/40 transition-all group">
                  <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-blue-500/30 text-blue-400 mb-2 transition-all">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-xs md:text-sm font-bold text-white">
                    {pdfFile ? pdfFile.name : "Sélectionner un fichier PDF"}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">Fichier unique contenant l'intégralité du chapitre</p>
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

          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs md:text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs md:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Chapitre créé et publié avec succès ! Redirection...</span>
            </div>
          )}

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
