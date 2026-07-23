"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Star, Film, Calendar, Tag, Play } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Anime = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  genre: string[];
  rating: number;
  source: string;
  episodesCount: number;
  uploader: {
    username: string;
    full_name: string;
  };
  episodes: {
    id: string;
    episodeNumber: number;
    title: string;
    duration: number;
  }[];
};

export default function AnimeDetailPage() {
  const params = useParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const animeId = params.id as string;

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(`${API_URL}/inkstream/${animeId}`);
        if (!res.ok) {
          throw new Error("Anime non trouvé");
        }
        const data = await res.json();
        setAnime(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [animeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
        <p className="text-gray-500 text-center">{error || "Anime non trouvé"}</p>
        <Link href="/inkstream" className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold">
          Retourner à InkStream
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/inkstream" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black truncate max-w-[150px]">{anime.title}</span>
          <div className="w-16" />
        </div>
      </header>

      {/* COUVERTURE */}
      <div className="relative aspect-[2/3] bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Film className="w-24 h-24 text-gray-400/50" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white">{anime.title}</h1>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{anime.rating || "N/A"}</span>
            <span>·</span>
            <span>{anime.genre?.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* INFOS */}
      <section className="px-4 py-4 border-b border-gray-200">
        <p className="text-gray-600 text-sm leading-relaxed">
          {anime.description || "Aucune description disponible."}
        </p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {anime.source || "Source inconnue"}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            {anime.episodesCount || 0} épisodes
          </span>
        </div>
      </section>

      {/* ÉPISODES */}
      <section className="flex-1 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Épisodes</h2>
        <div className="space-y-2">
          {anime.episodes && anime.episodes.length > 0 ? (
            anime.episodes.map((episode) => (
              <Link
                key={episode.id}
                href={`/inkstream/watch/${episode.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-black transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                    <Play className="w-3 h-3 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">
                      Épisode {episode.episodeNumber}
                    </p>
                    <p className="text-xs text-gray-400">{episode.title || `Épisode ${episode.episodeNumber}`}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {episode.duration ? `${Math.floor(episode.duration / 60)}min` : "Durée inconnue"}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Aucun épisode disponible</p>
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}