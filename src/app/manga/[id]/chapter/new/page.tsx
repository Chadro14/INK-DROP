"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Upload, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";

// Initialisation du client Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://TON_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "TA_CLE_ANON_SUPABASE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ink-backend.vercel.app";

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;

  const [number, setNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [isFree, setIsFree] = useState(true);
  const [isDraft, setIsDraft] = useState(false);

  const [uploadType, setUploadType] = useState<"pdf" | "images">("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageFiles, setPageFiles] = useState<FileList | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Upload direct vers le bucket Supabase
   */
  const uploadToSupabase = async (file: File, folderPath: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folderPath}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("chapters")
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      throw new Error(`Erreur lors du transfert de ${file.name} : ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("chapters").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté.");
      return;
    }

    if (uploadType === "pdf" && !pdfFile) {
      setError("Veuillez choisir un fichier PDF.");
      return;
    }

    if (uploadType === "images" && (!pageFiles || pageFiles.length === 0)) {
      setError("Veuillez sélectionner au moins une image.");
      return;
    }

    setLoading(true);

    try {
      let uploadedPdfUrl = "";
      let uploadedImagesUrls: string[] = [];
      let uploadedCoverUrl = "";

      // 1. Upload de la couverture (si renseignée)
      if (coverFile) {
        setStatusMessage("Transfert de la couverture...");
        uploadedCoverUrl = await uploadToSupabase(coverFile, `manga/${mangaId}/covers`);
      }

      // 2. Upload du PDF ou des images
      if (uploadType === "pdf" && pdfFile) {
        setStatusMessage("Transfert du PDF sur Supabase...");
        uploadedPdfUrl = await uploadToSupabase(pdfFile, `manga/${mangaId}/pdfs`);
      } else if (uploadType === "images" && pageFiles) {
        setStatusMessage(`Transfert des ${pageFiles.length} pages...`);
        for (let i = 0; i < pageFiles.length; i++) {
          const url = await uploadToSupabase(
            pageFiles[i],
            `manga/${mangaId}/ch_${number}`
          );
          uploadedImagesUrls.push(url);
          setStatusMessage(`Transfert des pages (${i + 1}/${pageFiles.length})...`);
        }
      }

      // 3. Envoi du payload JSON léger à NestJS
      setStatusMessage("Enregistrement du chapitre en base...");
      const res = await fetch(`${API_URL}/mangas/${mangaId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: Number(number),
          title: title || undefined,
          isFree: Boolean(isFree),
          isDraft: Boolean(isDraft),
          price: isFree ? 0 : Number(price),
          pdfUrl: uploadedPdfUrl || undefined,
          imagesUrls: uploadedImagesUrls.length > 0 ? uploadedImagesUrls : undefined,
          coverUrl: uploadedCoverUrl || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur serveur (${res.status})`);
      }

      // Redirection après succès
      router.push(`/manga/${mangaId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 max-w-lg mx-auto">
      <Link href={`/manga/${mangaId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
        <ArrowLeft className="w-5 h-5" />
        <span>Retour au manga</span>
      </Link>

      <h1 className="text-2xl font-bold mb-6">Nouveau chapitre</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* N° et Titre */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">N° Chapitre</label>
            <input
              type="number"
              min="1"
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Titre (optionnel)</label>
            <input
              type="text"
              placeholder="Ex: Le réveil"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black text-black"
            />
          </div>
        </div>

        {/* Format PDF ou Images */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Format du contenu</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUploadType("pdf")}
              className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                uploadType === "pdf" ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              <FileText className="w-4 h-4" />
              Fichier PDF
            </button>
            <button
              type="button"
              onClick={() => setUploadType("images")}
              className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                uploadType === "images" ? "border-black bg-black text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Images (PNG/JPG)
            </button>
          </div>
        </div>

        {/* Fichiers principal */}
        {uploadType === "pdf" ? (
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Document PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Pages du chapitre</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPageFiles(e.target.files)}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
            />
          </div>
        )}

        {/* Couverture Optionnelle */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Couverture du chapitre (Optionnelle)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
          />
        </div>

        {/* Options de publication */}
        <div className="p-4 border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Chapitre gratuit</span>
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-5 h-5 accent-black rounded cursor-pointer"
            />
          </div>

          {!isFree && (
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Prix ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.10"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black text-black"
              />
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors flex flex-col items-center justify-center gap-1"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">{statusMessage || "Chargement..."}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              <span>Publier le chapitre</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
