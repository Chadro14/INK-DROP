"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function AdminCertifyPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; username: string; role: string; isCertified: boolean } | null>(null);
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [certifying, setCertifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Erreur de chargement");

        if (data.role !== "ADMIN") {
          setError("Accès réservé aux administrateurs");
          setLoading(false);
          return;
        }

        setMe(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleCertify = async (userId: string) => {
    setCertifying(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/certification/certify/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur lors de la certification");

      setMessage(`✅ ${data.username} est maintenant certifié !`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCertifying(false);
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

  // ÉCRAN D'ACCÈS REFUSÉ / ERREUR
  if (error && !me) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 px-4 text-center text-white space-y-4">
        <div className="p-3.5 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-400 shadow-xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-zinc-400 text-sm max-w-xs">{error}</p>
        <Link 
          href="/profile" 
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white selection:bg-blue-500 selection:text-white pb-10">
      
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Admin Certification
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-xl mx-auto w-full space-y-6">

        {/* ALERTES */}
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: TON COMPTE */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-lg space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Ton compte (Admin)
          </p>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="font-bold text-white text-base flex items-center gap-1.5">
                {me?.username}
                {me?.isCertified && <BadgeCheck className="w-5 h-5 text-blue-400 fill-blue-500/20" />}
              </p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                {me?.isCertified ? "Statut : Certifié" : "Statut : Non certifié"}
              </p>
            </div>
            <button
              onClick={() => me && handleCertify(me.id)}
              disabled={certifying || me?.isCertified}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
            >
              {certifying ? "En cours..." : me?.isCertified ? "Certifié" : "Se certifier"}
            </button>
          </div>
        </section>

        {/* SECTION 2: AUTRE UTILISATEUR */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-lg space-y-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Certifier un membre (par ID)
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Ex: usr_98a72b14..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            />
            <button
              onClick={() => targetId && handleCertify(targetId)}
              disabled={certifying || !targetId.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none shrink-0"
            >
              {certifying ? "..." : "Certifier"}
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
