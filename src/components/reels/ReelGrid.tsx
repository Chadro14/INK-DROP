"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Film,
  Play,
  Eye,
  Heart,
  Lock,
  Clock,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Reel = {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isPrivate: boolean;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  type?: string;
  ctaLabel?: string | null;
  author?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
    isCertified?: boolean;
  };
};

type Props = {
  userId: string;
  isOwner?: boolean;
  emptyHint?: string;
};

export function ReelGrid({ userId, isOwner = false, emptyHint }: Props) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const res = await fetch(`${API_URL}/reels/user/${userId}`, { headers });

        if (!res.ok) {
          throw new Error("Impossible de charger les reels");
        }

        const data = await res.json();
        setReels(Array.isArray(data.data) ? data.data : []);
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchReels();
  }, [userId]);

  // Fermer la modal sur Escape
  useEffect(() => {
    if (!activeReel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveReel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeReel]);

  // ============================================
  // LOADER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm font-medium">Chargement des reels...</span>
      </div>
    );
  }

  // ============================================
  // ERREUR
  // ============================================
  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-rose-500 dark:text-rose-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  // ============================================
  // VIDE
  // ============================================
  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card/30 rounded-2xl border border-border/40 max-w-md mx-auto my-2">
        <Film className="w-10 h-10 text-muted-foreground/50" />
        <p className="text-muted-foreground mt-3 text-sm font-medium">
          {emptyHint || "Aucun reel publié"}
        </p>
        {isOwner && (
          <Link
            href="/creator/upload/video"
            className="mt-4 px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow shadow-purple-600/20"
          >
            Publier mon premier Reel
          </Link>
        )}
      </div>
    );
  }

  // ============================================
  // GRILLE
  // ============================================
  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {reels.map((reel) => {
          const isUnpublished = reel.status !== "PUBLISHED";
          return (
            <button
              key={reel.id}
              type="button"
              onClick={() => setActiveReel(reel)}
              className="group relative aspect-[9/16] bg-muted rounded-lg overflow-hidden border border-border/60 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-200"
            >
              {/* Miniature */}
              {reel.thumbnailUrl ? (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <video
                  src={reel.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Overlay gradient + stats */}
              <div className="absolute inset-x-0 bottom-0 p-1.5 md:p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
                <span className="flex items-center gap-1 text-white text-[10px] md:text-xs font-bold drop-shadow">
                  <Eye className="w-3 h-3 text-sky-400" />
                  {reel.viewsCount || 0}
                </span>
                <span className="flex items-center gap-1 text-white text-[10px] md:text-xs font-bold drop-shadow">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  {reel.likesCount || 0}
                </span>
              </div>

              {/* Icône Play au centre (visuel) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>

              {/* Badges (owner only) */}
              {isOwner && isUnpublished && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-white text-[9px] font-bold shadow">
                  {reel.status === "SCHEDULED" ? (
                    <>
                      <Clock className="w-2.5 h-2.5" />
                      Programm&eacute;
                    </>
                  ) : reel.isPrivate ? (
                    <>
                      <Lock className="w-2.5 h-2.5" />
                      Priv&eacute;
                    </>
                  ) : (
                    "Brouillon"
                  )}
                </div>
              )}

              {isOwner && reel.isPrivate && reel.status === "PUBLISHED" && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-900/90 text-white text-[9px] font-bold shadow">
                  <Lock className="w-2.5 h-2.5" />
                  Priv&eacute;
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* MODAL PLAYER */}
      {activeReel && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setActiveReel(null)}
        >
          <div
            className="relative w-full max-w-sm bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {activeReel.title}
                </p>
                {activeReel.author?.username && (
                  <Link
                    href={`/creator/${activeReel.author.username}`}
                    className="text-xs text-muted-foreground hover:text-foreground truncate"
                  >
                    @{activeReel.author.username}
                  </Link>
                )}
              </div>
              <button
                onClick={() => setActiveReel(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vidéo */}
            <div className="bg-black aspect-[9/16] max-h-[70vh] relative">
              <video
                src={activeReel.videoUrl}
                controls
                autoPlay
                playsInline
                loop
                className="w-full h-full object-contain"
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border/60 space-y-2">
              {activeReel.description && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {activeReel.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-500" />
                  {activeReel.viewsCount || 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  {activeReel.likesCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
