"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, CheckCircle, XCircle } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function AdminCertifyPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCertify = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!userId.trim()) {
      setError("Veuillez entrer un ID d'utilisateur");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/admin/certify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId.trim(),
          certify: true,
          reason: "Certification manuelle par l'administrateur",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la certification");
      }

      setSuccess(true);
      setMessage("✅ Utilisateur certifié avec succès !");
      setUserId("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/profile" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black">Admin - Certification</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-black" />
            <div>
              <h1 className="text-xl font-bold text-black">Certifier un utilisateur</h1>
              <p className="text-sm text-gray-500">Attribuer le badge de certification à un créateur</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {message}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              ID de l'utilisateur
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Ex: cm7v9k3n00000..."
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-black outline-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              L'ID est disponible dans l'URL du profil ou dans la base de données
            </p>
          </div>

          <button
            onClick={handleCertify}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Certification en cours...
              </span>
            ) : (
              "🎖️ Certifier l'utilisateur"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Seuls les administrateurs peuvent certifier des utilisateurs
          </p>
        </div>
      </main>
    </div>
  );
}
