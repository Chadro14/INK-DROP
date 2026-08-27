"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Play, AlertCircle, RefreshCw } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app/animes";

type EpisodeData = {
  success: boolean;
  remainingManas: number;
  anime: {
    id: string;
    title: string;
  };
  episode: {
    number: number;
    title: string;
    videoUrl: string;
    source: string;
    duration: number;
  };
  watchHistory: {
    id: string;
    progress: number;
    createdAt: string;
    lastWatchedAt: string;
  };
  message: string;
};

export default function WatchEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [manasError, setManasError] = useState(false);

  const animeId = params.animeId as string;
  const episodeNumber = parseInt(params.episodeNumber as string);

  useEffect(() => {
    const fetchEpisode = async () => {
      const token = localStorage.getItem("token");
      console.log("🔑 Token:", token);

      if (!token) {
        console.log("❌ Pas de token, redirection vers login");
        router.push("/login");
        return;
      }

      try {
        console.log(`📡 Appel API: ${API_URL}/${animeId}/watch/${episodeNumber}`);
        const res = await fetch(`${API_URL}/${animeId}/watch/${episodeNumber}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📊 Statut:", res.status);
        const text = await res.text();
        console.log("📝 Réponse brute:", text);

        // Gestion des erreurs MANAS (400)
        if (res.status === 400) {
          try {
            const data = JSON.parse(text);
            if (data.message && data.message.includes("MANAS insuffisants")) {
              setManasError(true);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Ignorer
          }
        }

        // Gestion des autres erreurs
        if (!res.ok) {
          let errorMessage = `Erreur ${res.status}`;
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Ignorer
          }
          throw new Error(errorMessage);
        }

        const data = JSON.parse(text);
        console.log("✅ Données reçues:", data);
        setEpisodeData(data);
      } catch (err: any) {
        console.error("❌ Erreur:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [animeId, episodeNumber, router]);

  // ============================================
  // AFFICHAGE MANAS INSUFFISANTS
  // ============================================
  if (manasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">MANAS insuffisants</h2>
          <p className="text-white/60 text-sm mb-6">
            Vous n'avez pas assez de MANAS pour regarder cet épisode.<br />
            Gagnez des MANAS en parrainant des amis ou abonnez-vous à INKDROP Premium.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/profile"
              className="px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-colors"
            >
              Voir mes MANAS
            </Link>
            <Link
              href="/premium"
              className="px-6 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Devenir Premium
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ============================================
  // CHARGEMENT
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ============================================
  // ERREUR
  // ============================================
  if (error || !episodeData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
        <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <p className="text-white/60 text-center max-w-sm">{error || "Épisode non trouvé"}</p>
        <p className="text-white/20 text-xs mt-2">Essayez de rafraîchir ou de revenir plus tard.</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
          <Link
            href={`/inkstream/${animeId}`}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-colors text-sm"
          >
            Retourner à l'anime
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // AFFICHAGE PRINCIPAL
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-black pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link
            href={`/inkstream/${animeId}`}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-sm font-medium text-white truncate max-w-[150px]">
            {episodeData.anime.title} - Ep. {episodeData.episode.number}
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* LECTEUR VIDÉO */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl aspect-video bg-white/5 rounded-lg overflow-hidden relative flex items-center justify-center border border-white/10">
          {episodeData.episode.videoUrl ? (
            <video
              className="w-full h-full"
              controls
              autoPlay
              poster=""
            >
              <source src={episodeData.episode.videoUrl} type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo.
            </video>
          ) : (
            <div className="text-center px-4">
              <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-sm">Vidéo non disponible</p>
              <p className="text-white/20 text-xs mt-1">
                Source: {episodeData.episode.source || "inconnue"}
              </p>
              <p className="text-white/10 text-xs mt-2 max-w-sm">
                {episodeData.message || "Aucune source de streaming trouvée pour cet épisode."}
              </p>
              <p className="text-white/10 text-[11px] mt-3 border-t border-white/5 pt-3">
                💡 Essayez un autre épisode ou vérifiez plus tard.
              </p>
            </div>
          )}
        </div>

        {/* INFOS ÉPISODE */}
        <div className="w-full max-w-4xl mt-4">
          <h2 className="text-lg font-bold text-white">
            Épisode {episodeData.episode.number}: {episodeData.episode.title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-white/40 text-sm mt-1">
            <span>{episodeData.anime.title}</span>
            {episodeData.episode.duration > 0 && (
              <span>Durée: {episodeData.episode.duration} min</span>
            )}
            <span className="flex items-center gap-1 text-amber-400/60">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400/40" />
              MANAS restants: {episodeData.remainingManas}
            </span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
