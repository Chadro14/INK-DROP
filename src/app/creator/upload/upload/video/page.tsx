"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  Music,
  Tag,
  Eye,
  Lock,
  Globe,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function UploadReelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState("");
  const [musicArtist, setMusicArtist] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError("La vidéo ne doit pas dépasser 100MB");
      return;
    }

    if (!file.type.startsWith("video/")) {
      setError("Le fichier doit être une vidéo");
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      setDuration(Math.round(video.duration));
      // Vérifier que la durée est entre 20 et 30 secondes
      if (video.duration < 20 || video.duration > 30) {
        setError("⚠️ La vidéo doit durer entre 20 et 30 secondes");
      } else {
        setError("");
      }
    };
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image");
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const uploadVideo = async (): Promise<string | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const urlRes = await fetch(`${API_URL}/reels/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename: videoFile?.name }),
      });

      if (!urlRes.ok) {
        throw new Error("Erreur lors de la génération de l'URL d'upload");
      }

      const urlData = await urlRes.json();
      const { uploadUrl, key } = urlData.data;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": videoFile?.type || "video/mp4",
        },
        body: videoFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Échec de l'upload de la vidéo");
      }

      return key;
    } catch (error: any) {
      console.error("Erreur upload vidéo:", error.message);
      throw error;
    }
  };

  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile) return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const urlRes = await fetch(`${API_URL}/reels/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename: thumbnailFile.name }),
      });

      if (!urlRes.ok) {
        throw new Error("Erreur lors de la génération de l'URL d'upload");
      }

      const urlData = await urlRes.json();
      const { uploadUrl, key } = urlData.data;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": thumbnailFile.type,
        },
        body: thumbnailFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Échec de l'upload de la vignette");
      }

      return key;
    } catch (error: any) {
      console.error("Erreur upload vignette:", error.message);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Veuillez entrer un titre");
      setUploading(false);
      return;
    }

    if (!videoFile) {
      setError("Veuillez sélectionner une vidéo");
      setUploading(false);
      return;
    }

    if (duration && (duration < 20 || duration > 30)) {
      setError("⚠️ La vidéo doit durer entre 20 et 30 secondes");
      setUploading(false);
      return;
    }

    try {
      const videoKey = await uploadVideo();
      if (!videoKey) {
        throw new Error("Échec de l'upload de la vidéo");
      }

      const thumbnailKey = await uploadThumbnail();

      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        videoUrl: videoKey,
        thumbnailUrl: thumbnailKey || undefined,
        duration: duration || undefined,
        musicTitle: musicTitle || undefined,
        musicArtist: musicArtist || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isPrivate,
      };

      const res = await fetch(`${API_URL}/reels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création du reel");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/reels");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground">

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <Play className="w-4 h-4 text-purple-400" />
            Publier un Reel
          </span>
          <div className="w-12" />
        </div>
      </header>

      <div className="h-16 w-full bg-gradient-to-r from-background via-purple-950/40 to-background border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
      </div>

      <main className="max-w-2xl mx-auto w-full px-4 -mt-8 flex-1">

        <form onSubmit={handleSubmit} className="bg-card/40 border border-border/80 rounded-2xl p-6 space-y-6">

          {error && (
            <div className="flex items-start gap-2 p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="whitespace-pre-wrap">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Reel publié avec succès ! Redirection...</span>
            </div>
          )}

          {/* TITRE */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre reel"
              className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none transition-all text-sm"
              maxLength={60}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre reel..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* VIDÉO */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Vidéo * <span className="text-xs text-muted-foreground font-normal">(20-30 secondes)</span>
            </label>
            {videoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border/80 bg-black/40 aspect-[9/16] max-h-[400px] mx-auto">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  loop
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                    setDuration(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                {duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-xs font-medium">
                    {Math.floor(duration / 60)}:
                    {String(duration % 60).padStart(2, "0")}
                    {duration >= 20 && duration <= 30 ? (
                      <span className="ml-1 text-emerald-400">✅</span>
                    ) : (
                      <span className="ml-1 text-rose-400">⚠️</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border hover:border-purple-500/50 rounded-xl cursor-pointer bg-card/30 hover:bg-card/50 transition-all group">
                <div className="p-4 rounded-full bg-card border border-border group-hover:border-purple-500/30 text-purple-400 mb-3 transition-all">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-foreground">Ajouter une vidéo</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WEBM • Max 100MB • 20-30s</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                  Format vertical recommandé (9:16)
                </p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* VIGNETTE */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Vignette
              <span className="text-xs text-muted-foreground font-normal ml-2">(optionnelle)</span>
            </label>
            {thumbnailPreview ? (
              <div className="relative w-32 h-48 rounded-xl overflow-hidden border border-border/80">
                <img
                  src={thumbnailPreview}
                  alt="Vignette"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-purple-500/50 rounded-xl cursor-pointer bg-card/30 hover:bg-card/50 transition-all group">
                <p className="text-sm font-medium text-foreground">Ajouter une vignette</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* MUSIQUE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                <Music className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
                Titre de la musique
              </label>
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="Titre"
                className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Artiste
              </label>
              <input
                type="text"
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="Artiste"
                className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* TAGS */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              <Tag className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Ajouter un tag"
                className="flex-1 px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all"
              >
                Ajouter
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-purple-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* VISIBILITÉ */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              <Eye className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
              Visibilité
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  !isPrivate
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-card/90 text-muted-foreground border-border hover:border-border/80"
                } flex items-center justify-center gap-2`}
              >
                <Globe className="w-4 h-4" />
                Public
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  isPrivate
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-card/90 text-muted-foreground border-border hover:border-border/80"
                } flex items-center justify-center gap-2`}
              >
                <Lock className="w-4 h-4" />
                Privé
              </button>
            </div>
          </div>

          {/* BOUTON */}
          <button
            type="submit"
            disabled={uploading || success}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Publier le Reel
              </>
            )}
          </button>

          <p className="text-[10px] text-muted-foreground text-center">
            En publiant, vous acceptez les conditions d'utilisation d'INKDROP
          </p>
        </form>

      </main>

      <BottomNav />
    </div>
  );
}
