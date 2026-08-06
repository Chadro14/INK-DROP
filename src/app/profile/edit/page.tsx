"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Camera, User, Mail, Save, AlertCircle, Share2, Settings } from "lucide-react";

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

  // Message pour le délai de 30 jours
  const [usernameChangeMessage, setUsernameChangeMessage] = useState("");

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
        
        // Vérifier le délai de 30 jours
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
  };

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
        if (res.status === 400 && data.message && data.message.includes("30 jours")) {
          setUsernameChangeMessage(data.message);
        }
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }

      // Upload de l'avatar
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
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER FIXE MINIMALISTE */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight">Modifier le profil</span>
          <div className="flex items-center gap-2 text-zinc-400">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-zinc-900 hover:text-white transition-all"
              title="Partager le profil"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={handleSettings}
              className="p-2 rounded-full hover:bg-zinc-900 hover:text-white transition-all"
              title="Paramètres"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 max-w-xl mx-auto w-full">

        {/* ALERTE ERREUR */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ALERTE SUCCÈS */}
        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 shadow-lg">
            <span>✅ Profil mis à jour avec succès ! Redirection...</span>
          </div>
        )}

        {/* ALERTE DÉLAI 30 JOURS */}
        {usernameChangeMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-sm flex items-start gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>{usernameChangeMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SÉLECTEUR AVATAR */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-zinc-900 border-4 border-zinc-950 ring-2 ring-blue-500/40 overflow-hidden flex items-center justify-center text-3xl font-black text-blue-400 shadow-2xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  username.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <label className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all shadow-lg hover:scale-105 active:scale-95">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-zinc-400 mt-2 font-medium">Clique sur l'icône pour changer la photo</p>
          </div>

          {/* NOM D'UTILISATEUR */}
          <div>
            <label className="block text-zinc-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-zinc-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* BIO */}
          <div>
            <label className="block text-zinc-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={160}
              placeholder="Présente-toi au monde en quelques mots..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/70 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium resize-none"
            />
            <p className="text-right text-[11px] text-zinc-500 mt-1 font-medium">
              {bio.length}/160 caractères
            </p>
          </div>

          {/* BOUTON D'ACTION */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </>
            )}
          </button>

        </form>
      </main>

      <BottomNav />
    </div>
  );
}
