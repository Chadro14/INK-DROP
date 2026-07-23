"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Play, Pause, Volume2, Maximize2 } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Episode = {
  id: string;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  duration: number;
  anime: {
    id: string;
    title: string;
  };
};

export default function WatchEpisodePage() {
  const params = useParams();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const episodeId = params.episode as string;

  useEffect(() => {
    // Simuler la récupération de l'épisode
    setTimeout(() => {
      setEpisode({
        id: episodeId,
        episodeNumber: 1,
        title: "Épisode 1",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Vidéo de test
        duration: 60,
        anime: {
          id: "1",
          title: "Anime Test",
        },
      });
      setLoading(false);
    }, 1000);
  }, [episodeId]);

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
        <Link href="/inkstream" className="mt-4 px-6 py-2 rounded-lg bg-white text-black font-semibold">
          Retourner à InkStream
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href={`/inkstream/${episode.anime.id}`} className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-sm font-medium text-white truncate max-w-[150px]">
            {episode.anime.title} - Ep. {episode.episodeNumber}
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* LECTEUR VIDÉO */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
          {/* Vidéo de test (placeholder) */}
          <video
            className="w-full h-full"
            controls
            poster=""
          >
            <source src={episode.videoUrl} type="video/mp4" />
            Votre navigateur ne supporte pas la vidéo.
          </video>
        </div>

        <div className="w-full max-w-4xl mt-4">
          <h2 className="text-lg font-bold text-white">
            Épisode {episode.episodeNumber}: {episode.title}
          </h2>
          <p className="text-white/40 text-sm">
            {episode.duration ? `${Math.floor(episode.duration / 60)}min` : "Durée inconnue"}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}