tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Camera, User, Mail, Lock, Save, X, AlertCircle, Share2, Settings } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

  // ✅ État pour le message des 30 jours
  const [usernameChangeMessage, setUsernameChangeMessage] = useState("");

  // ✅ État pour le partage
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        setUsername(data.username || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        setCurrentAvatar(data.avatarUrl || null);
        
        // ✅ Vérifier le délai de 30 jours pour le changement de nom
        if (data.lastUsernameChange) {
          const daysSinceLastChange = Math.floor(
            (Date.now() - new Date(data.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastChange < 30) {
            setUsernameChangeMessage(
              `⚠️ Vous pourrez changer votre nom dans ${30 - daysSinceLastChange} jours`
            );
          }
        }
      } catch (err) {
        setError("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Fonction pour le partage
  const handleShare = () => {
    const shareData = {
      title: `INKDROP - ${username}`,
      text: `Découvre le profil de ${username} sur INKDROP ! 📚`,
      url: `https://ink-drop-one.vercel.app/creator/${username}`,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("📋 Lien copié !");
    }
    setShareMenuOpen(false);
  };

  // ✅ Fonction pour les paramètres
  const handleSettings = () => {
    router.push("/profile/settings");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    setUsernameChangeMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, bio }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ✅ Gérer l'erreur "30 jours"
        if (res.status === 400 && data.message && data.message.includes("30 jours")) {
          setUsernameChangeMessage(data.message);
        }
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }

      // Upload de l'avatar (si présent)
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await fetch(`${API_URL}/users/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/profile"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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

      {/* HEADER avec boutons Share & Settings */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/profile" className="text-gray-500 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black">Modifier le profil</span>
          <div className="flex items-center gap-2">
            {/* ✅ Bouton Partager */}
            <button
              onClick={handleShare}
              className="text-gray-500 hover:text-black transition-colors"
              title="Partager le profil"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {/* ✅ Bouton Paramètres */}
            <button
              onClick={handleSettings}
              className="text-gray-500 hover:text-black transition-colors"
              title="Paramètres"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
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
            ✅ Profil mis à jour !
          </div>
        )}

        {usernameChangeMessage && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{usernameChangeMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* AVATAR */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-black overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  username.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-black text-white cursor-pointer hover:bg-gray-800 transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">Cliquez sur la caméra pour changer</p>
          </div>

          {/* Nom d'utilisateur */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Nom d'utilisateur</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-black focus:border-black outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-black focus:border-black outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Parlez-nous de vous..."
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:border-black outline-none transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum 160 caractères</p>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>

        </form>
      </main>

      <BottomNav />
    </div>
  );
}
