"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function CreatorRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    portfolioUrl: "",
    description: "",
    examples: [] as string[],
    proofImages: [] as string[],
    proofText: "",
  });

  // Champs temporaires pour l'ajout
  const [exampleInput, setExampleInput] = useState("");
  const [proofImageInput, setProofImageInput] = useState("");

  // Vérifier l'utilisateur connecté
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?redirect=/creator-request");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Erreur de chargement");

        setUser(data);

        // Vérifier si l'utilisateur est déjà créateur
        if (data.role === "CREATOR" || data.role === "ADMIN") {
          setError("Vous êtes déjà un créateur !");
        }

        // Vérifier si une demande est déjà en cours
        await checkExistingRequest(token);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  // Vérifier si une demande existe déjà
  const checkExistingRequest = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/creator-request/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "PENDING") {
          setError("Vous avez déjà une demande en attente de validation.");
        } else if (data.status === "APPROVED") {
          setError("Votre demande a déjà été approuvée !");
        }
      }
    } catch (error) {
      console.error("Erreur vérification demande:", error);
    }
  };

  // Ajouter un exemple (URL)
  const addExample = () => {
    if (exampleInput.trim() && formData.examples.length < 10) {
      setFormData({ ...formData, examples: [...formData.examples, exampleInput.trim()] });
      setExampleInput("");
    }
  };

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index),
    });
  };

  // Ajouter une image de preuve (URL)
  const addProofImage = () => {
    if (proofImageInput.trim() && formData.proofImages.length < 10) {
      setFormData({ ...formData, proofImages: [...formData.proofImages, proofImageInput.trim()] });
      setProofImageInput("");
    }
  };

  const removeProofImage = (index: number) => {
    setFormData({
      ...formData,
      proofImages: formData.proofImages.filter((_, i) => i !== index),
    });
  };

  // Soumettre la demande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Validation
    if (!formData.description || formData.description.length < 10) {
      setError("La description doit faire au moins 10 caractères.");
      return;
    }

    if (formData.examples.length === 0) {
      setError("Ajoutez au moins un exemple de votre travail.");
      return;
    }

    if (formData.proofImages.length === 0) {
      setError("Ajoutez au moins une image de preuve.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/creator-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          portfolioUrl: formData.portfolioUrl || null,
          description: formData.description,
          examples: formData.examples,
          proofImages: formData.proofImages,
          proofText: formData.proofText || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de la demande");
      }

      setSuccess(true);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // AFFICHAGE
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si l'utilisateur est déjà créateur
  if (user?.role === "CREATOR" || user?.role === "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-emerald-950/40 border-2 border-emerald-500/40 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Déjà un créateur !</h1>
        <p className="text-zinc-400 max-w-md">
          Vous avez déjà le statut de créateur. Vous pouvez publier des mangas et gérer vos chapitres.
        </p>
        <Link
          href="/profile"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  // Si la demande est en attente
  if (error === "Vous avez déjà une demande en attente de validation.") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-amber-950/40 border-2 border-amber-500/40 flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Demande en attente</h1>
        <p className="text-zinc-400 max-w-md">
          Votre demande est en cours d'examen par l'équipe INKDROP. Vous serez notifié dès qu'une décision sera prise.
        </p>
        <Link
          href="/profile"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  // Si la demande est approuvée
  if (error === "Votre demande a déjà été approuvée !") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-emerald-950/40 border-2 border-emerald-500/40 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Demande approuvée !</h1>
        <p className="text-zinc-400 max-w-md">
          Félicitations ! Vous êtes maintenant un créateur INKDROP. Vous pouvez publier vos mangas.
        </p>
        <Link
          href="/profile"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-rose-950/40 border-2 border-rose-500/40 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Non connecté</h1>
        <p className="text-zinc-400 max-w-md">
          Vous devez être connecté pour faire une demande de créateur.
        </p>
        <Link
          href="/login"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  // Si succès
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center text-white">
        <div className="w-20 h-20 rounded-full bg-emerald-950/40 border-2 border-emerald-500/40 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Demande envoyée !</h1>
        <p className="text-zinc-400 max-w-md">
          Votre demande a été envoyée avec succès. L'équipe INKDROP l'examinera dans les plus brefs délais.
        </p>
        <Link
          href="/profile"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  // ============================================
  // FORMULAIRE
  // ============================================
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Demande de créateur
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alertes */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Informations de base */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Présentation
            </h2>
            <p className="text-zinc-400 text-sm">
              Bonjour <span className="text-white font-bold">{user?.username}</span> ! 
              Remplissez ce formulaire pour faire une demande de créateur.
            </p>
          </div>

          {/* Portfolio URL */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-400" />
              Portfolio (optionnel)
            </h2>
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://instagram.com/votre-compte"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
            />
            <p className="text-zinc-500 text-xs">Lien vers votre portfolio (Instagram, DeviantArt, Behance, etc.)</p>
          </div>

          {/* Description */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Description <span className="text-rose-400 text-xs">*</span>
            </h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre travail, vos influences, votre style..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
              required
            />
            <p className="text-zinc-500 text-xs">
              {formData.description.length}/500 caractères minimum (10 requis)
            </p>
          </div>

          {/* Exemples */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              Exemples de dessins <span className="text-rose-400 text-xs">*</span>
            </h2>
            <p className="text-zinc-500 text-xs">Ajoutez des liens vers vos dessins (minimum 1)</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={exampleInput}
                onChange={(e) => setExampleInput(e.target.value)}
                placeholder="https://exemple.com/dessin.jpg"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={addExample}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.examples.map((url, index) => (
                <div key={index} className="flex items-center gap-1 bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-sm">
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-300 truncate max-w-[200px]">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-zinc-500 text-xs">{formData.examples.length}/10 exemples</p>
          </div>

          {/* Preuves */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Preuves <span className="text-rose-400 text-xs">*</span>
            </h2>
            <p className="text-zinc-500 text-xs">Ajoutez des images prouvant que vous êtes l'auteur (photos de processus, etc.)</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={proofImageInput}
                onChange={(e) => setProofImageInput(e.target.value)}
                placeholder="https://exemple.com/preuve.jpg"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={addProofImage}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.proofImages.map((url, index) => (
                <div key={index} className="flex items-center gap-1 bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-sm">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-300 truncate max-w-[200px]">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeProofImage(index)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-zinc-500 text-xs">{formData.proofImages.length}/10 preuves</p>
          </div>

          {/* Proof Text */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Explication supplémentaire (optionnel)
            </h2>
            <textarea
              value={formData.proofText}
              onChange={(e) => setFormData({ ...formData, proofText: e.target.value })}
              placeholder="Ajoutez une explication, un contexte, ou toute information complémentaire..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* Bouton de soumission */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Envoyer la demande
                </>
              )}
            </button>
            <Link
              href="/profile"
              className="px-6 py-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-white text-sm font-medium transition-all border border-zinc-700/50 text-center"
            >
              Annuler
            </Link>
          </div>

          <p className="text-zinc-500 text-xs text-center">
            Une fois votre demande envoyée, vous serez notifié par email ou notification.
          </p>
        </form>
      </main>
    </div>
  );
}

// Composant Clock manquant (ajouté en inline)
function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
