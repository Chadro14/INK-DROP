"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  Star, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  Clock,
  ArrowLeft,
  AlertCircle,
  Award,
  Sparkles
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type CertificationStatus = {
  isCertified: boolean;
  certifiedAt: string | null;
  badgeColor: string;
  conditions: {
    chapters: { current: number; required: number; met: boolean };
    followers: { current: number; required: number; met: boolean };
    age: { current: number; required: number; met: boolean };
  };
  canCertify: boolean;
};

export default function CertificationPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CertificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/certification/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [router]);

  // Fonction pour demander la certification
  const handleRequestCertification = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_URL}/certification/request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la demande de certification");
      }

      setSuccessMsg("Félicitations ! Votre certification a été activée.");
      await fetchStatus(); // Recharger le statut mis à jour
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // SPINNER DE CHARGEMENT
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ÉCRAN D'ERREUR
  if (error && !status) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 px-4 text-center text-white space-y-4">
        <div className="p-3.5 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-400 shadow-xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-zinc-400 text-sm max-w-xs">{error}</p>
        <button 
          onClick={() => router.push("/profile")} 
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30"
        >
          Retourner au profil
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button 
            onClick={() => router.back()} 
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-400" />
            Certification
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-lg mx-auto w-full space-y-6">

        {/* ALERTES */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* BADGES & STATUT PRINCIPAL */}
        <div className="text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
          {/* Background Glow */}
          {status?.isCertified && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] pointer-events-none" />
          )}

          <div 
            className="relative z-10 w-24 h-24 rounded-full mx-auto flex items-center justify-center border-2 transition-all duration-300 shadow-2xl"
            style={{ 
              borderColor: status?.isCertified ? (status.badgeColor || "#3b82f6") : "#27272a",
              backgroundColor: status?.isCertified ? `${status.badgeColor || "#3b82f6"}1a` : "#18181b",
              boxShadow: status?.isCertified ? `0 0 30px ${status.badgeColor || "#3b82f6"}33` : "none"
            }}
          >
            <Star 
              className="w-12 h-12 transition-transform duration-300 hover:scale-110" 
              style={{ 
                color: status?.isCertified ? (status.badgeColor || "#3b82f6") : "#52525b",
                fill: status?.isCertified ? (status.badgeColor || "#3b82f6") : "none"
              }} 
            />
          </div>

          <h2 className="text-xl font-extrabold text-white mt-4 tracking-tight">
            {status?.isCertified ? "Créateur Certifié" : "Non Certifié"}
          </h2>

          {status?.isCertified && (
            <p className="text-zinc-400 text-xs font-medium mt-1">
              Certifié depuis le {status.certifiedAt ? new Date(status.certifiedAt).toLocaleDateString() : "récemment"}
            </p>
          )}

          <p className="text-zinc-500 text-xs mt-2 max-w-xs mx-auto">
            {status?.isCertified 
              ? "Félicitations ! Vous bénéficiez du badge officiel et de la visibilité créateur sur INKDROP." 
              : "Remplissez tous les prérequis ci-dessous pour débloquer votre badge officiel."}
          </p>
        </div>

        {/* CONDITIONS DYNAMIQUES */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Conditions requises
          </p>

          {/* Chapitres */}
          <div className={`rounded-xl p-4 border transition-all ${
            status?.conditions.chapters.met 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-zinc-900/40 border-zinc-800/80'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${status?.conditions.chapters.met ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800/60 text-zinc-400'}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Chapitres publiés</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    <span className="text-white font-medium">{status?.conditions.chapters.current}</span> / {status?.conditions.chapters.required} requis
                  </p>
                </div>
              </div>
              {status?.conditions.chapters.met ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <span className="text-xs font-semibold text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-700/50">
                  En cours
                </span>
              )}
            </div>
          </div>

          {/* Abonnés */}
          <div className={`rounded-xl p-4 border transition-all ${
            status?.conditions.followers.met 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-zinc-900/40 border-zinc-800/80'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${status?.conditions.followers.met ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800/60 text-zinc-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Abonnés</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    <span className="text-white font-medium">{status?.conditions.followers.current}</span> / {status?.conditions.followers.required} requis
                  </p>
                </div>
              </div>
              {status?.conditions.followers.met ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <span className="text-xs font-semibold text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-700/50">
                  En cours
                </span>
              )}
            </div>
          </div>

          {/* Ancienneté */}
          <div className={`rounded-xl p-4 border transition-all ${
            status?.conditions.age.met 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-zinc-900/40 border-zinc-800/80'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${status?.conditions.age.met ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800/60 text-zinc-400'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Ancienneté du compte</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    <span className="text-white font-medium">{status?.conditions.age.current}</span> / {status?.conditions.age.required} jours
                  </p>
                </div>
              </div>
              {status?.conditions.age.met ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <span className="text-xs font-semibold text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-zinc-700/50">
                  En cours
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ACTION / STATUT GLOBAL */}
        <div className="pt-2">
          {status?.isCertified ? (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-center shadow-lg backdrop-blur-md">
              <p className="text-sm font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Vous êtes certifié 🌟
              </p>
            </div>
          ) : status?.canCertify ? (
            <button
              onClick={handleRequestCertification}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Demander la certification
                </>
              )}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-center">
              <p className="text-xs font-medium">Remplissez toutes les conditions pour débloquer la demande</p>
            </div>
          )}
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
