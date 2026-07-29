"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, AlertCircle, FileText, Image as ImageIcon, Info } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ink-backend.vercel.app";

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;

  const [number, setNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  const [uploadType, setUploadType] = useState<"pdf" | "images">("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageFiles, setPageFiles] = useState<FileList | null>(null);

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

      const rawData = await urlRes.json().catch(() => null);

      if (!urlRes.ok) {
        throw new Error(rawData?.message || `Erreur serveur (${urlRes.status})`);
      }

      const instructionsData = Array.isArray(rawData) ? rawData : (rawData?.data || []);

      if (!Array.isArray(instructionsData) || instructionsData.length === 0) {
        throw new Error("Le serveur n'a renvoyé aucune URL de téléversement valide.");
      }

      const instructions: Array<{ filename: string; uploadUrl: string; key: string }> = instructionsData;

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
      const imagesUrls: string[] = [];

      if (uploadType === "pdf" && pdfFile) {
        pdfUrl = instructions.find((i) => i.filename === pdfFile.name)?.key;
      } else if (uploadType === "images" && pageFiles) {
        Array.from(pageFiles).forEach((f) => {
          const key = instructions.find((i) => i.filename === f.name)?.key;
          if (key) imagesUrls.push(key);
        });
      }

      // 5. Enregistrement final des métadonnées du chapitre en BDD
      const payload = {
        number: parsedNumber,
        title: title.trim() || undefined,
        isFree: false, // Forcé à payant
        price: 0.55,  // Prix fixe imposé
        isDraft,
        pdfUrl,
        imagesUrls: imagesUrls.length > 0 ? imagesUrls : undefined,
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
    <div className="min-h-screen bg-white text-black px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation retour */}
        <Link 
          href={`/manga/${mangaId}`} 
          className="inline-flex items-center gap-2 text-black font-semibold hover:underline mb-8"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
          <span>Retour au manga</span>
        </Link>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black mb-3">
            Nouveau Chapitre
          </h1>
          <div className="flex items-start gap-3 p-4 border-2 border-black rounded-lg bg-gray-50">
            <Info className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-black">
              Les nouveaux chapitres sont configurés par défaut au tarif fixe de <strong>0,55 $</strong>.
              (Les deux derniers chapitres de l'œuvre restent toujours payants).
            </p>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-8 p-4 border-2 border-black bg-white rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-black">{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Bloc Informations Générales */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  N° Chapitre
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={number}
                  onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)}
                  required
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-bold text-black bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  Titre (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Le réveil du héros"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-bold text-black bg-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Bloc Format & Fichiers */}
          <div className="space-y-5">
            <label className="block text-sm font-bold text-black uppercase tracking-wide">
              Contenu du chapitre
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUploadType("pdf")}
                className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 font-bold transition-all ${
                  uploadType === "pdf" ? "border-black bg-black text-white" : "border-black bg-white text-black hover:bg-gray-100"
                }`}
              >
                <FileText className={`w-6 h-6 ${uploadType === "pdf" ? "text-white" : "text-black"}`} />
                Format PDF
              </button>
              <button
                type="button"
                onClick={() => setUploadType("images")}
                className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 font-bold transition-all ${
                  uploadType === "images" ? "border-black bg-black text-white" : "border-black bg-white text-black hover:bg-gray-100"
                }`}
              >
                <ImageIcon className={`w-6 h-6 ${uploadType === "images" ? "text-white" : "text-black"}`} />
                Format Images
              </button>
            </div>

            {/* Zone d'Upload Customisée */}
            <div className="mt-4">
              {uploadType === "pdf" ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-black border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-black" />
                    {pdfFile ? (
                      <p className="text-base font-bold text-black">{pdfFile.name}</p>
                    ) : (
                      <p className="text-sm font-bold text-black">Cliquez pour sélectionner votre PDF</p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    required
                    className="hidden"
                  />
                </label>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-black border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-3 text-black" />
                    {pageFiles && pageFiles.length > 0 ? (
                      <p className="text-lg font-extrabold text-black">
                        {pageFiles.length} {pageFiles.length > 1 ? "images sélectionnées" : "image sélectionnée"}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-black">Cliquez pour sélectionner vos images</p>
                        <p className="text-xs font-semibold text-black mt-1">(Formats PNG ou JPG)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setPageFiles(e.target.files)}
                    required
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Bouton de Soumission (Texte noir, fond blanc, bordure noire) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 border-2 border-black bg-white text-black text-lg rounded-lg font-extrabold hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-3 mt-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                <span>Publication en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-black" />
                <span>Publier le chapitre à 0.55 $</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
