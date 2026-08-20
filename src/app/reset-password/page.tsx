"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// ============================================
// COMPOSANT PRINCIPAL (AVEC LES PARAMS)
// ============================================
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ============================================
  // VÉRIFIER LE TOKEN
  // ============================================
  useEffect(() => {
    if (!token) {
      setError("Token manquant");
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_URL}/security/verify-reset-token/${token}`);
        const data = await res.json();

        if (data.valid) {
          setValidToken(true);
        } else {
          setError(data.message || "Token invalide ou expiré");
        }
      } catch (err) {
        setError("Erreur lors de la vérification du token");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // ============================================
  // RÉINITIALISER LE MOT DE PASSE
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/security/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la réinitialisation");
      }

      setSuccess("Mot de passe réinitialisé avec succès !");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // AFFICHAGE : VÉRIFICATION
  // ============================================
  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Vérification du token...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // AFFICHAGE : ERREUR
  // ============================================
  if (error && !validToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
        <div className="max-w-md w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-rose-950/30 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Token invalide</h1>
          <p className="text-zinc-400 text-sm mb-6">{error}</p>
          <Link
            href="/forgot-password"
            className="px-6 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-all"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // AFFICHAGE : FORMULAIRE
  // ============================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
      <div className="max-w-md w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8">
        
        {/* EN-TÊTE */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Nouveau mot de passe</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Crée un nouveau mot de passe pour ton compte
          </p>
        </div>

        {/* ALERTES */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Minimum 8 caractères, une majuscule, une minuscule, un chiffre
            </p>
          </div>

          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !validToken}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </button>
        </form>

        {/* LIEN DE RETOUR */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAGE PRINCIPALE AVEC SUSPENSE
// ============================================
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
