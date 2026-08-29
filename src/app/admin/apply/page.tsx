"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Upload,
  User,
  Mail,
  PenTool,
  BookOpen,
  Check,
  X,
  Sparkles,
  Crown,
  FileText,
  Image,
  Link2,
  Send,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  isCertified: boolean;
  premiumActive: boolean;
};

export default function ApplyCreatorPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ===== FORMULAIRE =====
  const [formData, setFormData] = useState({
    bio: "",
    experience: "",
    specialties: "",
    portfolioUrl: "",
    socialLinks: "",
    reason: "",
  });

  const [files, setFiles] = useState<{
    samples?: File;
    idDocument?: File;
  }>({});

  // ============================================
  // CHARGEMENT DE L'UTILISATEUR
  // ============================================
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Erreur lors du chargement");
        }

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        console.error("❌ Erreur fetchUser:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // ============================================
  // SOUMISSION
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      // 1. Envoyer les données du formulaire
      const formPayload = new FormData();
      formPayload.append("bio", formData.bio);
      formPayload.append("experience", formData.experience);
      formPayload.append("specialties", formData.specialties);
      formPayload.append("portfolioUrl", formData.portfolioUrl);
      formPayload.append("socialLinks", formData.socialLinks);
      formPayload.append("reason", formData.reason);

      if (files.samples) {
        formPayload.append("samples", files.samples);
      }
      if (files.idDocument) {
        formPayload.append("idDocument", files.idDocument);
      }

      const res = await fetch(`${API_URL}/creator/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la soumission");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 3000);
    } catch (err: any) {
      console.error("❌ Erreur soumission:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // GESTION DES FICHIERS
  // ============================================
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "samples" | "idDocument"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  // ============================================
  // RENDU
  // ============================================
  if (loading) {
    return <Loader message="Chargement de votre profil" />;
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-zinc-600" />
        </div>
        <p className="text-zinc-400 text-center">{error || "Utilisateur non trouvé"}</p>
        <Link
          href="/profile"
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Retourner au profil
        </Link>
      </div>
    );
  }

  // Si déjà dessinateur
  if (user.isCertified) {
    return (
      <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">
        <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Link href="/profile" className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Retour</span>
            </Link>
            <span className="text-sm font-bold text-white/90">Compte Dessinateur</span>
            <div className="w-16" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Vous êtes déjà dessinateur !</h2>
            <p className="text-zinc-400 text-sm">
              Votre compte est déjà certifié. Vous pouvez publier et gérer vos mangas.
            </p>
            <Link
              href="/profile"
              className="mt-6 inline-block px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all"
            >
              Aller au profil
            </Link>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/profile" className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <span className="text-sm font-bold text-white/90 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-blue-400" />
            Devenir Dessinateur
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* ===== BANNIÈRE ===== */}
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6 mb-6 text-center">
            <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">Devenez dessinateur certifié</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Publiez vos mangas, touchez une audience et gagnez en crédibilité
            </p>
          </div>

          {/* ===== FORMULAIRE ===== */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                <User className="w-3.5 h-3.5 inline mr-1.5" />
                Biographie
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Parlez-nous de vous, de votre style, de vos influences..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-white placeholder-zinc-600 focus:border-blue-500 outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Expérience */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                Expérience
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="Décrivez votre expérience dans le dessin/manga (années, formations, publications...)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-white placeholder-zinc-600 focus:border-blue-500 outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Spécialités */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                <PenTool className="w-3.5 h-3.5 inline mr-1.5" />
                Spécialités
              </label>
              <input
                type="text"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder="Ex: Shonen, Shojo, Seinen, Illustration, Storyboard..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-white placeholder-zinc-600 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                <Link2 className="w-3.5 h-3.5 inline mr-1.5" />
                Portfolio (URL)
              </label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                placeholder="https://votre-portfolio.com"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-white placeholder-zinc-600 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Réseaux sociaux */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                <Link2 className="w-3.5 h-3.5 inline mr-1.5" />
                Réseaux sociaux
              </label>
              <input
                type="text"
                value={formData.socialLinks}
                onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                placeholder="Instagram, Twitter, DeviantArt, etc."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-white placeholder-zinc-600 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                Pourquoi voulez-vous devenir dessinateur ?
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Votre motivation, vos projets, ce que vous apporterez à INKDROP..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-white placeholder-zinc-600 focus:border-blue-500 outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Fichiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Échantillons */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  <Image className="w-3.5 h-3.5 inline mr-1.5" />
                  Échantillons (3-5 dessins)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "samples")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-zinc-500 hover:border-blue-500/50 transition-all flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm truncate">
                      {files.samples ? files.samples.name : "Choisir des fichiers"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pièce d'identité */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                  Pièce d'identité (facultatif)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "idDocument")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-zinc-500 hover:border-blue-500/50 transition-all flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm truncate">
                      {files.idDocument ? files.idDocument.name : "Choisir un fichier"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Succès */}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Demande envoyée avec succès ! Vous allez être redirigé...
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={submitting || success}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : success ? (
                <>
                  <Check className="w-5 h-5" />
                  Envoyé !
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer ma demande
                </>
              )}
            </button>

            <p className="text-xs text-zinc-500 text-center">
              Votre demande sera examinée par notre équipe. Vous recevrez une réponse sous 48h.
            </p>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
