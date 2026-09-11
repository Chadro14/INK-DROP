"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Scissors, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface VideoTrimmerProps {
  file: File;
  onTrimChange: (start: number, end: number) => void;
  maxDuration?: number;
}

export function VideoTrimmer({
  file,
  onTrimChange,
  maxDuration = 30,
}: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("");

  // ✅ Créer l'URL de la vidéo
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // ✅ Charger les métadonnées
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimEnd(video.duration);
      setTrimStart(0);
    };

    const handleTimeUpdate = () => {
      // ✅ Boucler sur la zone trim
      if (video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
      }
      // ✅ Ne pas aller avant trimStart
      if (video.currentTime < trimStart) {
        video.currentTime = trimStart;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoUrl, trimStart, trimEnd]);

  // ✅ Notifier le parent du changement
  useEffect(() => {
    if (duration > 0) {
      onTrimChange(trimStart, trimEnd);
    }
  }, [trimStart, trimEnd, duration, onTrimChange]);

  // ✅ Play/Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      // ✅ Démarre depuis trimStart si on est hors zone
      if (video.currentTime < trimStart || video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
      }
      video.play().catch(() => {});
    }
  }, [isPlaying, trimStart, trimEnd]);

  // ✅ Reset
  const handleReset = useCallback(() => {
    setTrimStart(0);
    setTrimEnd(duration);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [duration]);

  // ✅ Formatage du temps
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${String(s).padStart(2, "0")}.${ms}`;
  };

  const trimmedDuration = trimEnd - trimStart;
  const isOverLimit = trimmedDuration > maxDuration;
  const isTooShort = trimmedDuration < 1;

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="space-y-4">
      {/* ===== APERÇU VIDÉO ===== */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[400px] mx-auto">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
          muted={isMuted}
          loop
        />

        {/* Bouton Mute */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-all"
          title={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Bouton Play overlay */}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group"
        >
          <div
            className={`w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all ${
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            }`}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-1" />
            )}
          </div>
        </button>

        {/* Indicateur de temps actuel */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-mono">
          {videoRef.current
            ? formatTime(videoRef.current.currentTime)
            : "0:00.0"}{" "}
          / {formatTime(duration)}
        </div>
      </div>

      {/* ===== SLIDER DÉBUT ===== */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-bold flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5" />
            Début
          </span>
          <span className="font-mono font-bold text-foreground">
            {formatTime(trimStart)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={trimStart}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value < trimEnd - 1) {
              setTrimStart(value);
            }
          }}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-blue-500 slider-thumb"
          style={{
            background: `linear-gradient(to right, hsl(var(--muted)) 0%, hsl(var(--muted)) ${
              (trimStart / duration) * 100
            }%, hsl(var(--blue-500, 59 130 246)) ${
              (trimStart / duration) * 100
            }%, hsl(var(--blue-500, 59 130 246)) ${
              (trimEnd / duration) * 100
            }%, hsl(var(--muted)) ${(trimEnd / duration) * 100}%, hsl(var(--muted)) 100%)`,
          }}
        />
      </div>

      {/* ===== SLIDER FIN ===== */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-bold flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 rotate-180" />
            Fin
          </span>
          <span className="font-mono font-bold text-foreground">
            {formatTime(trimEnd)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={trimEnd}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value > trimStart + 1) {
              setTrimEnd(value);
            }
          }}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-blue-500 slider-thumb"
        />
      </div>

      {/* ===== RÉSUMÉ + RESET ===== */}
      <div
        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
          isOverLimit
            ? "bg-rose-950/30 border-rose-500/40"
            : isTooShort
            ? "bg-amber-950/30 border-amber-500/40"
            : "bg-muted/40 border-border/60"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Scissors
            className={`w-4 h-4 shrink-0 ${
              isOverLimit
                ? "text-rose-400"
                : isTooShort
                ? "text-amber-400"
                : "text-blue-400"
            }`}
          />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              Durée sélectionnée :{" "}
              <span className="font-bold text-foreground">
                {formatTime(trimmedDuration)}
              </span>
            </p>
            {isOverLimit && (
              <p className="text-[10px] text-rose-400 font-medium mt-0.5">
                ⚠️ Dépasse la limite de {maxDuration}s
              </p>
            )}
            {isTooShort && (
              <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                ⚠️ Durée minimum : 1 seconde
              </p>
            )}
            {!isOverLimit && !isTooShort && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Max : {maxDuration}s
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-xs font-bold text-foreground transition-all shrink-0"
          title="Réinitialiser la découpe"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}
