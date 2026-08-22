"use client";

import { useEffect, useState } from "react";
import { useParams } useRouter } from "next/navigation";

const API_URL = "https://ink-backend.vercel.app";

export default function ChapterReaderTest() {
  const params = useParams();
  const [chapter, setChapter] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState(null);

  const mangaId = params.id as string;
  const chapterNumber = parseInt(params.number as string);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        console.log("🔍 TEST: Début du chargement");
        const url = `${API_URL}/mangas/${mangaId}/chapters/number/${chapterNumber}`;
        console.log("📡 TEST: URL =", url);

        const res = await fetch(url);
        console.log("📡 TEST: Status =", res.status);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("📦 TEST: Données reçues =", data);
        setRawData(data);
        setChapter(data);
      } catch (err: any) {
        console.error("❌ TEST: Erreur =", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [mangaId, chapterNumber]);

  // ============================================
  // AFFICHAGE MINIMALISTE
  // ============================================
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-red-500 text-xl">❌ Erreur: {error}</h1>
        <pre className="mt-4 text-xs text-zinc-400">
          mangaId: {mangaId}
          chapterNumber: {chapterNumber}
        </pre>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-yellow-500">⚠️ Aucun chapitre trouvé</h1>
      </div>
    );
  }

  // ✅ AFFICHAGE DES DONNÉES BRUTES
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">📖 Chapitre {chapter.number}</h1>
      <p className="text-zinc-400">Titre: {chapter.title || "Sans titre"}</p>
      <p className="text-zinc-400">Type: {chapter.contentType || "Inconnu"}</p>
      <p className="text-zinc-400">Pages: {chapter.pageCount || 0}</p>
      <p className="text-zinc-400">PDF URL: {chapter.pdfUrl ? "✅ Oui" : "❌ Non"}</p>
      <p className="text-zinc-400">PDF Key: {chapter.pdfKey || "null"}</p>
      <p className="text-zinc-400">Images: {chapter.pages?.length || 0}</p>
      
      <div className="mt-6 p-4 bg-zinc-900 rounded-lg overflow-auto max-h-96">
        <pre className="text-xs text-zinc-300">
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </div>

      {/* BOUTONS DE NAVIGATION */}
      <div className="mt-6 flex gap-4">
        <a 
          href={`/manga/${mangaId}`}
          className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"
        >
          ← Retour
        </a>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          🔄 Recharger
        </button>
      </div>
    </div>
  );
}
