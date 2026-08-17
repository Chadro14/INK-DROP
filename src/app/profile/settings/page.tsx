"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  ArrowLeft, 
  Lock, 
  Shield, 
  LogOut, 
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Mail,
  Bell,
  Palette,
  Globe,
  Smartphone,
  Monitor,
  Download,
  Loader2,
  ChevronRight,
  Moon,
  Sun,
  Laptop,
  Check,
  XCircle
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// Types
type NotificationSettings = {
  newChapter: boolean;
  newComment: boolean;
  newSubscriber: boolean;
  earning: boolean;
  system: boolean;
};

type Preferences = {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
};

type Tab = 'password' | 'email' | 'notifications' | 'preferences' | 'account';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>('password');

  // ===== ÉTATS : MOT DE PASSE =====
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ===== ÉTATS : EMAIL =====
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  // ===== ÉTATS : NOTIFICATIONS =====
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    newChapter: true,
    newComment: true,
    newSubscriber: true,
    earning: true,
    system: true,
  });

  // ===== ÉTATS : PRÉFÉRENCES =====
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'system',
    language: 'fr',
  });

  // ===== CHARGEMENT INITIAL =====
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadUserData();
  }, [router]);

  const loadUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [notifRes, prefRes] = await Promise.all([
        fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (notifRes.ok) {
        const data = await notifRes.json();
        if (data.notificationSettings) {
          setNotifSettings(data.notificationSettings);
        }
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error("Erreur chargement des préférences:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CHANGER LE MOT DE PASSE
  // ============================================
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

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
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

      setSuccess("Mot de passe changé avec succès !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // CHANGER L'EMAIL (Étape 1 : Demande)
  // ============================================
  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!newEmail || !emailPassword) {
      setError("Veuillez remplir tous les champs");
      setSaving(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/request-email-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la demande");
      }

      setSuccess("Un email de vérification a été envoyé à votre nouvelle adresse.");
      setShowEmailConfirm(true);
      setNewEmail("");
      setEmailPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // CHANGER L'EMAIL (Étape 2 : Confirmation)
  // ============================================
  const handleConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!emailToken) {
      setError("Veuillez entrer le token reçu par email");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/confirm-email-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: emailToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Token invalide");
      }

      setSuccess("Email changé avec succès !");
      setEmailToken("");
      setShowEmailConfirm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // METTRE À JOUR LES NOTIFICATIONS
  // ============================================
  const handleUpdateNotifications = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notifSettings),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }

      setSuccess("Préférences de notification mises à jour !");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // METTRE À JOUR LES PRÉFÉRENCES
  // ============================================
  const handleUpdatePreferences = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }

      setSuccess("Préférences mises à jour !");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // SUPPRIMER LE COMPTE
  // ============================================
  const handleDeleteAccount = async () => {
    const password = prompt("⚠️ Pour confirmer la suppression, entrez votre mot de passe :");
    if (!password) return;

    if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues !")) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la suppression");
      }

      localStorage.removeItem("token");
      setSuccess("Compte supprimé avec succès");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  // ============================================
  // DÉCONNEXION
  // ============================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ============================================
  // EXPORTER LES DONNÉES
  // ============================================
  const handleExportData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      // Récupérer toutes les données
      const [userRes, mangasRes, commentsRes] = await Promise.all([
        fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/mangas?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/social/comments`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const user = await userRes.json();
      const mangas = await mangasRes.json();
      const comments = await commentsRes.json();

      const data = {
        user,
        mangas: mangas.data || [],
        comments: comments.data || [],
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inkdrop-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccess("Données exportées avec succès !");
    } catch (err: any) {
      setError("Erreur lors de l'export des données");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // RENDU DES ONGLETS
  // ============================================
  const tabs = [
    { id: 'password', label: 'Mot de passe', icon: Lock },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Préférences', icon: Palette },
    { id: 'account', label: 'Compte', icon: Shield },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight">Paramètres</span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 max-w-xl mx-auto w-full space-y-6">

        {/* ONGLETS */}
        <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-hide bg-zinc-900/30 rounded-xl p-1 border border-zinc-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ALERTES */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 1 : MOT DE PASSE */}
        {/* ========================================== */}
        {activeTab === 'password' && (
          <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Changer le mot de passe
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-zinc-300 text-xs font-semibold mb-1.5">
                  Mot de passe actuel
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 text-xs font-semibold mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-zinc-300 text-xs font-semibold mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? "Masquer" : "Afficher"} les mots de passe
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Changer le mot de passe"}
              </button>
            </form>
          </section>
        )}

        {/* ========================================== */}
        {/* TAB 2 : EMAIL */}
        {/* ========================================== */}
        {activeTab === 'email' && (
          <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              Changer l'email
            </h2>

            {!showEmailConfirm ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1.5">
                    Nouvel email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nouveau@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1.5">
                    Mot de passe (pour confirmer)
                  </label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer la demande"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1.5">
                    Token de vérification
                  </label>
                  <input
                    type="text"
                    value={emailToken}
                    onChange={(e) => setEmailToken(e.target.value)}
                    placeholder="Entrez le token reçu par email"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1.5">
                    Un token a été envoyé à votre nouvelle adresse email. Vérifiez vos spams.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer le changement"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailConfirm(false)}
                  className="w-full py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  ← Retour à la demande
                </button>
              </form>
            )}
          </section>
        )}

        {/* ========================================== */}
        {/* TAB 3 : NOTIFICATIONS */}
        {/* ========================================== */}
        {activeTab === 'notifications' && (
          <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              Notifications
            </h2>

            <div className="space-y-3">
              {Object.entries(notifSettings).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 cursor-pointer hover:border-zinc-700 transition-all">
                  <span className="text-sm font-medium text-zinc-300 capitalize">
                    {key === 'newChapter' && '📖 Nouveau chapitre'}
                    {key === 'newComment' && '💬 Nouveau commentaire'}
                    {key === 'newSubscriber' && '👤 Nouvel abonné'}
                    {key === 'earning' && '💰 Gains'}
                    {key === 'system' && '⚙️ Système'}
                  </span>
                  <div className="relative w-11 h-6 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => setNotifSettings({ ...notifSettings, [key]: !value })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300" />
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ${value ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
              ))}

              <button
                onClick={handleUpdateNotifications}
                disabled={saving}
                className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer les préférences"}
              </button>
            </div>
          </section>
        )}

        {/* ========================================== */}
        {/* TAB 4 : PRÉFÉRENCES */}
        {/* ========================================== */}
        {activeTab === 'preferences' && (
          <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-400" />
              Préférences
            </h2>

            <div className="space-y-4">
              {/* THÈME */}
              <div>
                <label className="block text-zinc-300 text-xs font-semibold mb-2">
                  Thème
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: 'Clair', icon: Sun },
                    { value: 'dark', label: 'Sombre', icon: Moon },
                    { value: 'system', label: 'Système', icon: Laptop },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, theme: value as Preferences['theme'] })}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                        preferences.theme === value
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LANGUE */}
              <div>
                <label className="block text-zinc-300 text-xs font-semibold mb-2">
                  Langue
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'fr', label: '🇫🇷 Français' },
                    { value: 'en', label: '🇬🇧 English' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, language: value as Preferences['language'] })}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        preferences.language === value
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUpdatePreferences}
                disabled={saving}
                className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer les préférences"}
              </button>
            </div>
          </section>
        )}

        {/* ========================================== */}
        {/* TAB 5 : COMPTE */}
        {/* ========================================== */}
        {activeTab === 'account' && (
          <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Gestion du compte
            </h2>

            <div className="space-y-3">
              {/* Exporter les données */}
              <button
                onClick={handleExportData}
                disabled={saving}
                className="w-full py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold border border-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-zinc-400" />
                Exporter mes données
              </button>

              {/* Déconnexion */}
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold border border-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-zinc-400" />
                Se déconnecter
              </button>

              {/* Supprimer le compte */}
              <button
                onClick={handleDeleteAccount}
                disabled={saving}
                className="w-full py-3 rounded-full bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20 text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer mon compte
              </button>

              <p className="text-xs text-zinc-500 text-center mt-2">
                La suppression du compte est irréversible. Toutes vos données seront perdues.
              </p>
            </div>
          </section>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
