"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !me) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4 text-center">
        <p className="text-gray-500">{error}</p>
        <Link href="/profile" className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold">
          Retour au profil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-10">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center max-w-lg mx-auto">
          <Link href="/profile" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black mx-auto pr-10">Certification</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6">

        {message && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Certifier son propre compte */}
        <section className="p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Ton compte</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-black flex items-center gap-1">
                {me?.username}
                {me?.isCertified && <BadgeCheck className="w-4 h-4 text-yellow-500" />}
              </p>
              <p className="text-xs text-gray-400">{me?.isCertified ? "Déjà certifié" : "Non certifié"}</p>
            </div>
            <button
              onClick={() => me && handleCertify(me.id)}
              disabled={certifying || me?.isCertified}
              className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40"
            >
              {certifying ? "..." : me?.isCertified ? "Certifié" : "Certifier"}
            </button>
          </div>
        </section>

        {/* Certifier un autre utilisateur par ID */}
        <section className="p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Certifier un autre utilisateur (par ID)</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="ID utilisateur"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-black"
            />
            <button
              onClick={() => targetId && handleCertify(targetId)}
              disabled={certifying || !targetId}
              className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium disabled:opacity-40"
            >
              Certifier
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}