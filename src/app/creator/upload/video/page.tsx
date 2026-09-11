"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { VideoTrimmer } from "@/components/reels/VideoTrimmer";
import { MentionInput } from "@/components/reels/MentionInput";
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  X,
  Tag,
  Eye,
  Lock,
  Globe,
  Sparkles,
  Link as LinkIcon,
  Calendar,
  Clock,
  Scissors,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

const REEL_TYPES = [
  { value: "MANGA_TEASER", label: "Teaser de manga", icon: "🎬", linksTo: "manga" },
  { value: "MANGA_CHARACTER", label: "Présentation de personnage", icon: "👤", linksTo: "manga" },
  { value: "MANGA_CHAPTER_PREVIEW", label: "Extrait de chapitre", icon: "📖", linksTo: "chapter" },
  { value: "MANGA_ANNOUNCEMENT", label: "Annonce de nouveau chapitre", icon: "📢", linksTo: "manga" },
  { value: "MANGA_TRAILER", label: "Bande-annonce", icon: "🎥", linksTo: "manga" },
  { value: "CREATOR_PORTFOLIO", label: "Présentation créateur", icon: "🎨", linksTo: "creator" },
  { value: "CREATOR_TIMELAPSE", label: "Timelapse de dessin", icon: "⏱️", linksTo: "creator" },
  { value: "CREATOR_MAKING_OF", label: "Making-of", icon: "🎞️", linksTo: "creator" },
  { value: "EVENT_PROMO", label: "Promotion d'événement", icon: "🎉", linksTo: "event" },
  { value: "EVENT_BATTLE", label: "Battle de mangas", icon: "⚔️", linksTo: "event" },
  { value: "EVENT_DRAWING_CHALLENGE", label: "Défi dessin", icon: "✏️", linksTo: "event" },
  { value: "RISING_CREATOR", label: "Rising Creator", icon: "🚀", linksTo: "event" },
  { value: "INKDROP_AWARDS", label: "INKdrop Awards", icon: "🏆", linksTo: "event" },
  { value: "INKDROP_TOURNAMENT", label: "INKdrop Tournament", icon: "🥇", linksTo: "event" },
  { value: "INKDROP_OFFICIAL", label: "Reel officiel INKdrop", icon: "✨", linksTo: "none" },
  { value: "OTHER", label: "Autre", icon: "📹", linksTo: "none" },
];

type Manga = { id: string; title: string; slug?: string };
type Chapter = { id: string; number: number; title?: string; mangaId: string };
type EventItem = { id: string; title: string; type: string };

export default function UploadReelPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  // ✅ NOUVEAU : Trim virtuel
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState<number | null>(null);

  // ✅ NOUVEAU : Publication programmée
  const [publishMode, setPublishMode] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // ✅ NOUVEAU : Mentions
  const [mentionIds, setMentionIds] = useState<string[]>([]);

  const [type, setType] = useState("OTHER");
  const [mangaId, setMangaId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [eventId, setEventId] = useState("");
  const [featuredCreatorId, setFeaturedCreatorId] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");

  const [mangas, setMangas] = useState<Manga[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [mangasError, setMangasError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedType = REEL_TYPES.find((t) => t.value === type);
  const linksTo = selectedType?.linksTo || "none";

  // ✅ Charger les données
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingData(true);
      setMangasError("");

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const meRes = await fetch(`${API_URL}/users/me`, { headers });
        if (!meRes.ok) throw new Error("Impossible de récupérer votre profil");

        const meData = await meRes.json();
        const userId = meData.id || meData.data?.id;
        if (!userId) throw new Error("ID utilisateur introuvable");

        const mangasRes = await fetch(`${API_URL}/mangas/creator/${userId}`, { headers });
        if (mangasRes.ok) {
          const mangasData = await mangasRes.json();
          const list = mangasData.data || [];
          setMangas(Array.isArray(list) ? list : []);
        } else {
          setMangasError("Impossible de charger vos mangas");
        }

        const eventsRes = await fetch(`${API_URL}/events?isActive=true`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const list = eventsData.data || eventsData || [];
          setEvents(Array.isArray(list) ? list : []);
        }
      } catch (err: any) {
        console.error("Erreur chargement données:", err);
        setMangasError(err.message || "Erreur de chargement");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Charger les chapitres
  useEffect(() => {
    if (!mangaId || linksTo !== "chapter") {
      setChapters([]);
      return;
    }

    const fetchChapters = async () => {
      try {
        const res = await fetch(`${API_URL}/mangas/${mangaId}`);
        if (res.ok) {
          const data = await res.json();
          const mangaChapters = data.data?.chapters || [];
          setChapters(Array.isArray(mangaChapters) ? mangaChapters : []);
        }
      } catch (err) {
        console.error("Erreur chargement chapitres:", err);
      }
    };

    fetchChapters();
  }, [mangaId, linksTo]);

  // ✅ Reset les liaisons
  useEffect(() => {
    if (linksTo !== "manga" && linksTo !== "chapter") setMangaId("");
    if (linksTo !== "chapter") setChapterId("");
    if (linksTo !== "event") setEventId("");
    if (linksTo !== "creator") setFeaturedCreatorId("");
  }, [type, linksTo]);

  // ============================================
  // VIDÉO
  // ============================================
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

    // Reset trim
    setTrimStart(0);
    setTrimEnd(null);

    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      const durationInSeconds = Math.round(video.duration);
      setDuration(durationInSeconds);
      if (durationInSeconds > 30) {
        setError("⚠️ La vidéo ne doit pas dépasser 30 secondes");
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

  // ============================================
  // TAGS
  // ============================================
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // ============================================
  // TRIM CALLBACK
  // ============================================
  const handleTrimChange = useCallback((start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
  }, []);

  // ============================================
  // UPLOAD VIDÉO
  // ============================================
  const uploadVideo = async (): Promise<string | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté");
      return null;
    }

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
        const errorData = await urlRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la génération de l'URL d'upload");
      }

      const urlData = await urlRes.json();
      const { uploadUrl, key } = urlData.data;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": videoFile?.type || "video/mp4" },
        body: videoFile,
      });

      if (!uploadRes.ok) {
        throw new Error(`Échec de l'upload de la vidéo (${uploadRes.status})`);
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

      if (!urlRes.ok) return null;

      const urlData = await urlRes.json();
      const { uploadUrl, key } = urlData.data;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": thumbnailFile.type },
        body: thumbnailFile,
      });

      if (!uploadRes.ok) return null;

      return key;
    } catch (error: any) {
      console.error("Erreur upload vignette:", error.message);
      return null;
    }
  };

  // ============================================
  // SOUMISSION
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      setUploading(false);
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

    if (duration && duration > 30) {
      setError("⚠️ La vidéo ne doit pas dépasser 30 secondes");
      setUploading(false);
      return;
    }

    if (linksTo === "manga" && !mangaId) {
      setError("Veuillez sélectionner un manga");
      setUploading(false);
      return;
    }
    if (linksTo === "chapter" && !chapterId) {
      setError("Veuillez sélectionner un chapitre");
      setUploading(false);
      return;
    }
    if (linksTo === "event" && !eventId) {
      setError("Veuillez sélectionner un événement");
      setUploading(false);
      return;
    }

    // ✅ Vérifier la programmation
    let scheduledAt: string | undefined = undefined;
    if (publishMode === "scheduled") {
      if (!scheduledDate || !scheduledTime) {
        setError("Veuillez choisir une date et une heure de publication");
        setUploading(false);
        return;
      }

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
      if (scheduledDateTime <= new Date()) {
        setError("La date programmée doit être dans le futur");
        setUploading(false);
        return;
      }

      scheduledAt = scheduledDateTime.toISOString();
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

        // ✅ Trim virtuel
        trimStart: trimStart > 0 ? trimStart : undefined,
        trimEnd: trimEnd || undefined,

        tags: tags.length > 0 ? tags : undefined,
        isPrivate,
        type,
        ctaLabel: ctaLabel.trim() || undefined,
        mangaId: mangaId || undefined,
        chapterId: chapterId || undefined,
        eventId: eventId || undefined,
        featuredCreatorId: featuredCreatorId || undefined,

        // ✅ Programmation
        scheduledAt,

        // ✅ Mentions
        mentionIds: mentionIds.length > 0 ? mentionIds : undefined,
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

  // ============================================
  // RENDU
  // ============================================
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

          {/* TYPE */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
              Type de Reel *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground focus:border-purple-500 outline-none transition-all text-sm"
            >
              {REEL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* LIAISON AU CONTENU */}
          {linksTo !== "none" && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" />
                Contenu lié
              </p>

              {(linksTo === "manga" || linksTo === "chapter") && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Manga *
                  </label>
                  {mangasError ? (
                    <div className="text-xs text-rose-400 p-2 rounded bg-rose-950/30 border border-rose-500/30">
                      {mangasError}
                    </div>
                  ) : loadingData ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Chargement de vos mangas...
                    </div>
                  ) : mangas.length === 0 ? (
                    <div className="text-xs text-amber-400 p-2 rounded bg-amber-950/30 border border-amber-500/30">
                      Vous n'avez pas encore de manga.{" "}
                      <Link href="/creator/upload" className="underline font-bold">
                        Publier un manga
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={mangaId}
                      onChange={(e) => setMangaId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-card/90 border border-border text-foreground text-sm"
                    >
                      <option value="">-- Sélectionner --</option>
                      {mangas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {linksTo === "chapter" && mangaId && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Chapitre *
                  </label>
                  <select
                    value={chapterId}
                    onChange={(e) => setChapterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-card/90 border border-border text-foreground text-sm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        Chapitre {c.number} {c.title ? `- ${c.title}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {linksTo === "event" && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Événement *
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-card/90 border border-border text-foreground text-sm"
                  >
                    <option value="">-- Sélectionner --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                  {events.length === 0 && !loadingData && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Aucun événement actif.
                    </p>
                  )}
                </div>
              )}

              {linksTo === "creator" && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    ID du créateur *
                  </label>
                  <input
                    type="text"
                    value={featuredCreatorId}
                    onChange={(e) => setFeaturedCreatorId(e.target.value)}
                    placeholder="UUID du créateur"
                    className="w-full px-3 py-2 rounded-lg bg-card/90 border border-border text-foreground text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Laissez vide pour vous-même
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Bouton d'action (CTA)
              <span className="text-xs text-muted-foreground font-normal ml-2">(optionnel)</span>
            </label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Ex: Lire le manga, Voir le profil, Voter..."
              className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none transition-all text-sm"
              maxLength={50}
            />
          </div>

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

          {/* DESCRIPTION avec MENTIONS */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Description
              <span className="text-xs text-muted-foreground font-normal ml-2">
                (tapez @ pour mentionner)
              </span>
            </label>
            <MentionInput
              value={description}
              onChange={setDescription}
              onMentionSelect={(userId) => {
                setMentionIds((prev) =>
                  prev.includes(userId) ? prev : [...prev, userId]
                );
              }}
              placeholder="Décrivez votre reel... Mentionnez des créateurs avec @"
              maxLength={500}
              rows={3}
            />
          </div>

          {/* VIDÉO */}
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">
              Vidéo * <span className="text-xs text-muted-foreground font-normal">(max 30 secondes)</span>
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
                    setTrimStart(0);
                    setTrimEnd(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 transition-all z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                {duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-xs font-medium flex items-center gap-1 z-10">
                    {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
                    {duration <= 30 ? (
                      <span className="text-emerald-400">✅</span>
                    ) : (
                      <span className="text-rose-400">⚠️</span>
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
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WEBM • Max 100MB • Max 30s</p>
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

          {/* ✅ TRIM VIDÉO — NOUVEAU */}
          {videoFile && (
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-blue-400" />
                <p className="text-sm font-bold text-blue-300">
                  Découper la vidéo
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    (optionnel)
                  </span>
                </p>
              </div>
              <VideoTrimmer
                file={videoFile}
                onTrimChange={handleTrimChange}
                maxDuration={30}
              />
            </div>
          )}

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
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

          {/* ✅ PUBLICATION PROGRAMMÉE — NOUVEAU */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <p className="text-sm font-bold text-purple-300">
                Publication
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPublishMode("now")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${
                  publishMode === "now"
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-card/90 text-muted-foreground border-border hover:border-border/80"
                }`}
              >
                <Play className="w-4 h-4" />
                Maintenant
              </button>
              <button
                type="button"
                onClick={() => setPublishMode("scheduled")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${
                  publishMode === "scheduled"
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-card/90 text-muted-foreground border-border hover:border-border/80"
                }`}
              >
                <Clock className="w-4 h-4" />
                Programmer
              </button>
            </div>

            {publishMode === "scheduled" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-lg bg-card/90 border border-border text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-card/90 border border-border text-foreground text-sm"
                  />
                </div>
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
                {publishMode === "scheduled" ? "Programmer le Reel" : "Publier le Reel"}
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
