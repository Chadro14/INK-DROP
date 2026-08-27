"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Star, Film, Calendar, Tag, Play } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app/animes";

type AnimeDetail = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  bannerImage: string;
  genre: string[];
  rating: number;
  source: string;
  episodesCount: number;
  status: string;
  episodes: {
    id: string;
    episodeNumber: number;
    title: string;
    duration: number;
  }[];
};

export default function AnimeDetailPage() {
  const params = useParams();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const animeId = params.id as string;

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(`${API_URL}/${animeId}`);
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
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
        <p className="text-white/60 text-center">{error || "Anime non trouvé"}</p>
        <Link href="/inkstream" className="mt-4 px-6 py-2 rounded-lg bg-white text-black font-semibold">
          Retourner à InkStream
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-black">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/inkstream" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-white truncate max-w-[150px]">{anime.title}</span>
          <div className="w-16" />
        </div>
      </header>

      {/* COUVERTURE */}
      <div className="relative aspect-[2/3] bg-white/5">
        {anime.coverImage ? (
          <img 
            src={anime.coverImage} 
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            Pas d'image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white">{anime.title}</h1>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            {anime.rating > 0 && (
              <>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{anime.rating.toFixed(1)}</span>
                <span>·</span>
              </>
            )}
            <span>{anime.genre?.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* INFOS */}
      <section className="px-4 py-4 border-b border-white/5">
        <p className="text-white/60 text-sm leading-relaxed">
          {anime.description || "Aucune description disponible."}
        </p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/40">
          <span className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            {anime.episodesCount || 0} épisodes
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {anime.status || "Statut inconnu"}
          </span>
        </div>
      </section>

      {/* ÉPISODES */}
      <section className="flex-1 px-4 py-4">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Épisodes</h2>
        <div className="space-y-2">
          {anime.episodes && anime.episodes.length > 0 ? (
            anime.episodes.map((episode) => (
              <Link
                key={episode.id}
                href={`/inkstream/watch/${episode.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Play className="w-3 h-3 text-white/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Épisode {episode.episodeNumber}
                    </p>
                    <p className="text-xs text-white/40">{episode.title || `Épisode ${episode.episodeNumber}`}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-white/40 text-sm text-center py-8">Aucun épisode disponible</p>
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
