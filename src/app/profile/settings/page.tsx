"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  ArrowLeft, 
  Lock, 
  Bell, 
  Shield, 
  Users, 
  Moon, 
  LogOut, 
  Trash2,
  Eye,
  EyeOff,
  Save
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setSaving(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du changement de mot de passe");
      }

      setSuccess("✅ Mot de passe changé avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white">

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/profile" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black">Paramètres</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Mot de passe */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Changer le mot de passe
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Mot de passe actuel</label>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black focus:border-black outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Nouveau mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black focus:border-black outline-none transition-colors"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black focus:border-black outline-none transition-colors"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPassword ? "Masquer" : "Afficher"} les mots de passe
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                "Changer le mot de passe"
              )}
            </button>
          </form>
        </section>

        {/* Compte */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compte
          </h2>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-lg bg-gray-100 text-black font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-3"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>

          <button
            onClick={() => {
              if (confirm("⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible !")) {
                // Logique de suppression
              }
            }}
            className="w-full py-3 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer mon compte
          </button>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}