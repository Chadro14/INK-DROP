"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, AlertCircle, FileText, Image as ImageIcon, Info, Trash2, Plus } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ink-backend.vercel.app";

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;

  const [season, setSeason] = useState<number>(1);
  const [number, setNumber] = useState<number>(1);
  const [title, setTitle] = useState("");

  const [uploadType, setUploadType] = useState<"pdf" | "images">("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // Tableau pour cumuler les images (plusieurs sessions)
  const [pageFiles, setPageFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fonction pour cumuler les images sans effacer les précédentes
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPageFiles((prev) => [...prev, ...newFiles]);
    }
    // Réinitialise l'input pour permettre de re-sélectionner si besoin
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedSeason = Number(season);
    const parsedNumber = Number(number);

    if (!parsedNumber || parsedNumber < 1 || parsedNumber > 10) {
      setError("Le numéro du chapitre doit être compris entre 1 et 10.");
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

    if (uploadType === "images" && pageFiles.length === 0) {
      setError("Veuillez sélectionner au moins une image.");
      return;
    }

    setLoading(true);

    try {
      const filesToUpload: File[] = uploadType === "pdf" && pdfFile ? [pdfFile] : pageFiles;
      const filenames = filesToUpload.map((f) => f.name);

      // Envoi de la demande d'URL (on inclut fileNames et filenames au cas où le backend préfère l'un ou l'autre)
      const urlRes = await fetch(`${API_URL}/mangas/${mangaId}/chapters/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filenames, fileNames: filenames }),
      });

      const rawData = await urlRes.json().catch(() => null);

      if (!urlRes.ok) {
        throw new Error(rawData?.message || `Erreur serveur (${urlRes.status})`);
      }

      // Recherche de la liste des URLs dans les différents formats possibles du backend
      let instructionsData: any[] = [];
      if (Array.isArray(rawData)) instructionsData = rawData;
      else if (rawData?.data && Array.isArray(rawData.data)) instructionsData = rawData.data;
      else if (rawData?.urls && Array.isArray(rawData.urls)) instructionsData = rawData.urls;
      else if (rawData?.uploadUrls && Array.isArray(rawData.uploadUrls)) instructionsData = rawData.uploadUrls;

      if (instructionsData.length === 0) {
        throw new Error("Le serveur n'a renvoyé aucune URL de téléversement valide.");
      }

      // Upload direct vers le stockage (ex: AWS, Supabase, etc.)
      for (const file of filesToUpload) {
        const target = instructionsData.find((i: any) => i.filename === file.name);
        if (!target) {
          throw new Error(`Aucune URL trouvée pour le fichier : ${file.name}`);
        }

        const uploadRes = await fetch(target.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error(`Échec de l'envoi de ${file.name}`);
        }
      }

      // Récupération des clés/URLs publiques
      let pdfUrl: string | undefined;
      const imagesUrls: string[] = [];

      if (uploadType === "pdf" && pdfFile) {
        pdfUrl = instructionsData.find((i: any) => i.filename === pdfFile.name)?.key;
      } else if (uploadType === "images") {
        pageFiles.forEach((f) => {
          const key = instructionsData.find((i: any) => i.filename === f.name)?.key;
          if (key) imagesUrls.push(key);
        });
      }

      // Sauvegarde du chapitre dans la base de données
      const payload = {
        season: parsedSeason,
        number: parsedNumber,
        title: title.trim() || undefined,
        isFree: false, 
        price: 0.55,  
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
        
        <Link 
          href={`/manga/${mangaId}`} 
          className="inline-flex items-center gap-2 text-black font-extrabold hover:underline mb-8 uppercase tracking-wider text-sm"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
          <span>Retour</span>
        </Link>

        <div className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black uppercase">
            Nouveau Chapitre
          </h1>
          
          <div className="flex flex-col gap-3 p-4 border-2 border-black bg-white rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-black">
                PRIX FIXE : Le chapitre sera vendu à 0,55 $. Les deux derniers chapitres sont obligatoirement payants.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-black">
                LIMITE : Un chapitre est limité à 10 par saison. Arrivé à 10, passez à la saison suivante.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 border-2 border-black bg-white rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-black flex-shrink-0" />
            <p className="text-base font-extrabold text-black">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-extrabold text-black mb-2 uppercase tracking-wide">
                Saison
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={season}
                onChange={(e) => setSeason(parseInt(e.target.value, 10) || 1)}
                required
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-black font-extrabold text-black bg-white text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-extrabold text-black mb-2 uppercase tracking-wide">
                Chapitre
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="1"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)}
                required
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-black font-extrabold text-black bg-white text-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-black mb-2 uppercase tracking-wide">
                Titre (Optionnel)
              </label>
              <input
                type="text"
                placeholder="Nom du chapitre..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-black font-extrabold text-black bg-white text-lg placeholder-black/30"
              />
            </div>
          </div>

          <div className="space-y-5">
            <label className="block text-sm font-extrabold text-black uppercase tracking-wide">
              Contenu
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUploadType("pdf")}
                className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 font-extrabold transition-all ${
                  uploadType === "pdf" ? "border-black bg-black text-white" : "border-black bg-white text-black hover:bg-black/5"
                }`}
              >
                <FileText className={`w-6 h-6 ${uploadType === "pdf" ? "text-white" : "text-black"}`} />
                PDF
              </button>
              <button
                type="button"
                onClick={() => setUploadType("images")}
                className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 font-extrabold transition-all ${
                  uploadType === "images" ? "border-black bg-black text-white" : "border-black bg-white text-black hover:bg-black/5"
                }`}
              >
                <ImageIcon className={`w-6 h-6 ${uploadType === "images" ? "text-white" : "text-black"}`} />
                IMAGES
              </button>
            </div>

            <div className="mt-4">
              {uploadType === "pdf" ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-black border-dashed rounded-lg cursor-pointer bg-white hover:bg-black/5 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-black" />
                    {pdfFile ? (
                      <p className="text-lg font-extrabold text-black">{pdfFile.name}</p>
                    ) : (
                      <p className="text-base font-extrabold text-black">Cliquez pour ajouter le PDF</p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-black border-dashed rounded-lg cursor-pointer bg-white hover:bg-black/5 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-3 text-black" />
                      {pageFiles.length > 0 ? (
                        <>
                          <p className="text-2xl font-black text-black">
                            {pageFiles.length} IMAGES
                          </p>
                          <p className="text-sm font-extrabold text-black mt-2 flex items-center gap-1 underline">
                            <Plus className="w-4 h-4 text-black" /> Ajouter encore des images
                          </p>
                        </>
                      ) : (
                        <p className="text-base font-extrabold text-black">Cliquez pour ajouter des images</p>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelection}
                      className="hidden"
                    />
                  </label>
                  
                  {pageFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPageFiles([])}
                      className="flex items-center justify-center gap-2 p-3 border-2 border-black rounded-lg text-black font-extrabold hover:bg-black/5 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-black" />
                      VIDER LA SÉLECTION (RECOMMENCER)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 border-2 border-black bg-white text-black text-xl rounded-lg font-black uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-50 transition-all flex items-center justify-center gap-3 mt-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
                <span>PUBLICATION...</span>
              </>
            ) : (
              <>
                <Upload className="w-7 h-7" />
                <span>PUBLIER (0.55 $)</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
