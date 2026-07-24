"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Play, Pause, Volume2, Maximize2, AlertCircle } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Episode = {
  id: string;
  episodeNumber: number;
  title: string;
  streamUrl: string;
  animeTitle: string;
};

export default function WatchEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [manasError, setManasError] = useState(false);

  const animeId = params.id as string;
  const episodeNumber = parseInt(params.episode as string);

  useEffect(() => {
    const fetchEpisode = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/inkstream/${animeId}/watch/${episodeNumber}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 400) {
          const data = await res.json();
          if (data.message && data.message.includes("MANAS insuffisants")) {
            setManasError(true);
            setLoading(false);
            return;
          }
        }

        if (!res.ok) {
          throw new Error("Erreur lors du chargement de l'épisode");
        }

        const data = await res.json();
        setEpisode({
          id: data.episode.id,
          episodeNumber: data.episode.episodeNumber,
          title: data.episode.title || `Épisode ${data.episode.episodeNumber}`,
          streamUrl: data.streamUrl || "",
          animeTitle: data.animeTitle || "Anime",
        });
      } catch (err: any) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
        <p className="text-white/60 text-center">{error || "Épisode non trouvé"}</p>
        <Link href={`/inkstream/${animeId}`} className="mt-4 px-6 py-2 rounded-lg bg-white text-black font-semibold">
          Retourner à l'anime
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href={`/inkstream/${animeId}`} className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-sm font-medium text-white truncate max-w-[150px]">
            {episode.animeTitle} - Ep. {episode.episodeNumber}
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* LECTEUR VIDÉO */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl aspect-video bg-white/5 rounded-lg overflow-hidden relative flex items-center justify-center border border-white/10">
          {episode.streamUrl ? (
            <video
              className="w-full h-full"
              controls
              autoPlay
              poster=""
            >
              <source src={episode.streamUrl} type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo.
            </video>
          ) : (
            <div className="text-center">
              <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-sm">Vidéo non disponible</p>
              <p className="text-white/20 text-xs mt-1">Essayez un autre épisode</p>
            </div>
          )}
        </div>

        <div className="w-full max-w-4xl mt-4">
          <h2 className="text-lg font-bold text-white">
            Épisode {episode.episodeNumber}: {episode.title}
          </h2>
          <p className="text-white/40 text-sm">{episode.animeTitle}</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}