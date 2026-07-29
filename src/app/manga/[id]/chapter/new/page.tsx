"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";

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
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedNumber = Number(number);
    if (!parsedNumber || parsedNumber < 1) {
      setError("Le numéro du chapitre doit être un entier valide.");
      return;
    }

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
      // 1. Lister tous les fichiers à uploader
      const filesToUpload: File[] = [];
      if (uploadType === "pdf" && pdfFile) {
        filesToUpload.push(pdfFile);
      } else if (uploadType === "images" && pageFiles) {
        Array.from(pageFiles).forEach((f) => filesToUpload.push(f));
      }
      if (coverFile) {
        filesToUpload.push(coverFile);
      }

      const filenames = filesToUpload.map((f) => f.name);

      // 2. Demander au backend les URLs signées
      const urlRes = await fetch(`${API_URL}/mangas/${mangaId}/chapters/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filenames }),
      });

      const data = await urlRes.json().catch(() => null);

      // Vérification de sécurité : s'assure que le backend a renvoyé un Tableau [] et pas une erreur {}
      if (!urlRes.ok || !Array.isArray(data)) {
        console.error("Erreur serveur ou format invalide :", data);
        throw new Error(
          data?.message || `Erreur du serveur d'upload (${urlRes.status})`
        );
      }

      const instructions: Array<{ filename: string; uploadUrl: string; key: string }> = data;

      // 3. Upload direct vers Supabase Storage via PUT
      for (const file of filesToUpload) {
        const target = instructions.find((i) => i.filename === file.name);
        if (!target) {
          throw new Error(`Aucune URL d'upload trouvée pour le fichier : ${file.name}`);
        }

        const uploadRes = await fetch(target.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error(`Échec du téléversement de ${file.name} vers le stockage.`);
        }
      }

      // 4. Extraire les URLs publiques finales
      let pdfUrl: string | undefined;
      let coverUrl: string | undefined;
      const imagesUrls: string[] = [];

      if (uploadType === "pdf" && pdfFile) {
        pdfUrl = instructions.find((i) => i.filename === pdfFile.name)?.key;
      } else if (uploadType === "images" && pageFiles) {
        Array.from(pageFiles).forEach((f) => {
          const key = instructions.find((i) => i.filename === f.name)?.key;
          if (key) imagesUrls.push(key);
        });
      }

      if (coverFile) {
        coverUrl = instructions.find((i) => i.filename === coverFile.name)?.key;
      }

      // 5. Enregistrement final des métadonnées du chapitre en BDD
      const payload = {
        number: parsedNumber,
        title: title.trim() || undefined,
        isFree,
        isDraft,
        price: isFree ? 0 : Number(price),
        pdfUrl,
        imagesUrls: imagesUrls.length > 0 ? imagesUrls : undefined,
        coverUrl,
      };

      const res = await fetch(`${API_URL}/mangas/${mangaId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur lors de la création (${res.status})`);
      }

      router.push(`/manga/${mangaId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
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
        {/* Numéro et Titre */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">N° Chapitre</label>
            <input
              type="number"
              min="1"
              step="1"
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)}
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

        {/* Choix PDF vs Images */}
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

        {/* Inputs Fichiers */}
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

        {/* Couverture */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Couverture (Optionnelle)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
          />
        </div>

        {/* Options Tarifaires */}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Téléversement direct...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Publier le chapitre</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
