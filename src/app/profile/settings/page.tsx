"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  ArrowLeft,
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
  Download,
  Loader2,
  ChevronRight,
  Moon,
  Sun,
  Laptop,
  User,
  Key,
  ShieldCheck,
  Settings as SettingsIcon,
  Sparkles,
  Languages,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type NotificationSettings = {
  newChapter: boolean;
  newComment: boolean;
  newSubscriber: boolean;
  earning: boolean;
  system: boolean;
};

type Preferences = {
  theme: "light" | "dark" | "system";
  language: "fr" | "en";
};

type Tab = "account" | "security" | "notifications" | "preferences" | "advanced";

// ============================================
// ✅ LISTE DES TABS
// ============================================
const TABS: { id: Tab; icon: any; label: string }[] = [
  { id: "account", icon: User, label: "Compte" },
  { id: "security", icon: Shield, label: "Sécurité" },
  { id: "notifications", icon: Bell, label: "Notifs" },
  { id: "preferences", icon: Palette, label: "Apparence" },
  { id: "advanced", icon: SettingsIcon, label: "Avancé" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [user, setUser] = useState<any>(null);

  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email states
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  // Notification states
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    newChapter: true,
    newComment: true,
    newSubscriber: true,
    earning: true,
    system: true,
  });

  // Preferences states
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "system",
    language: "fr",
  });

  // ============================================
  // LOAD USER DATA
  // ============================================
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
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);

        if (data.notificationSettings) {
          setNotifSettings(data.notificationSettings);
        }

        if (data.preferences) {
          setPreferences({
            theme: data.preferences.theme || "system",
            language: data.preferences.language || "fr",
          });
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // ============================================
  // CHANGE PASSWORD
  // ============================================
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères");
      setSaving(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      showSuccess("Mot de passe mis à jour");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // CHANGE EMAIL
  // ============================================
  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    clearMessages();

    if (!newEmail || !emailPassword) {
      setError("Veuillez remplir tous les champs");
      setSaving(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

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
      if (!res.ok) throw new Error(data.message || "Erreur");

      showSuccess("Email de vérification envoyé");
      setShowEmailConfirm(true);
      setNewEmail("");
      setEmailPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    clearMessages();

    if (!emailToken) {
      setError("Token requis");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/confirm-email-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: emailToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Token invalide");

      showSuccess("Email mis à jour");
      setEmailToken("");
      setShowEmailConfirm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // UPDATE NOTIFICATIONS
  // ============================================
  const handleUpdateNotifications = async () => {
    setSaving(true);
    clearMessages();

    const token = localStorage.getItem("token");
    if (!token) return;

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
      if (!res.ok) throw new Error(data.message || "Erreur");

      showSuccess("Notifications mises à jour");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // UPDATE PREFERENCES
  // ============================================
  const handleUpdatePreferences = async () => {
    setSaving(true);
    clearMessages();

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/users/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          theme: preferences.theme,
          language: preferences.language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      showSuccess("Préférences mises à jour");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // CHANGE THEME (via provider global)
  // ============================================
  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    setSaving(true);
    clearMessages();

    try {
      await setGlobalTheme(theme);
      setPreferences({ ...preferences, theme });
      showSuccess(
        theme === "light"
          ? "Thème clair activé"
          : theme === "dark"
          ? "Thème sombre activé"
          : "Thème système activé"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE ACCOUNT
  // ============================================
  const handleDeleteAccount = async () => {
    const password = prompt("Entrez votre mot de passe pour confirmer :");
    if (!password) return;

    if (!confirm("Êtes-vous sûr ? Cette action est irréversible.")) return;

    setSaving(true);
    clearMessages();

    const token = localStorage.getItem("token");
    if (!token) return;

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
      if (!res.ok) throw new Error(data.message || "Erreur");

      localStorage.removeItem("token");
      showSuccess("Compte supprimé");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ============================================
  // EXPORT DATA
  // ============================================
  const handleExportData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inkdrop-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showSuccess("Données exportées");
    } catch {
      setError("Erreur d'export");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // TOGGLE COMPONENT
  // ============================================
  const Toggle = ({
    value,
    onChange,
    label,
    description,
  }: {
    value: boolean;
    onChange: () => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
          value ? "bg-blue-600" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-foreground tracking-tight">
            Paramètres
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">

        {/* ===== ALERTS ===== */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-2 animate-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 animate-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ===== TABS ===== */}
        <div className="grid grid-cols-5 gap-1.5 mb-6 bg-card/30 rounded-2xl p-1.5 border border-border/60 backdrop-blur-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center gap-1 ${
                  isActive
                    ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================== */}
        {/* TAB : ACCOUNT */}
        {/* ========================================== */}
        {activeTab === "account" && (
          <div className="space-y-4 animate-in">
            {/* Profile card */}
            <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black text-white shrink-0 overflow-hidden ring-2 ring-blue-500/30"
                  style={{ backgroundColor: user?.avatarColor || "#3B82F6" }}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-foreground truncate">
                    {user?.username || "Utilisateur"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "—"}
                  </p>
                </div>
                {user?.isCertified && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Certifié
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground text-xs">Rôle</span>
                  <span className="text-foreground text-xs font-semibold">
                    {user?.role === "ADMIN"
                      ? "Administrateur"
                      : user?.role === "CREATOR"
                      ? "Créateur"
                      : "Lecteur"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-muted-foreground text-xs">Membre depuis</span>
                  <span className="text-foreground text-xs font-semibold">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                {user?.premiumActive && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground text-xs">Premium</span>
                    <span className="text-violet-400 text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Actif
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB : SECURITY */}
        {/* ========================================== */}
        {activeTab === "security" && (
          <div className="space-y-4 animate-in">
            {/* Password */}
            <div className="bg-card/40 border border-border/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30">
                  <Key className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Changer le mot de passe</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-muted-foreground text-xs font-medium mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm"
                      required
                      minLength={8}
                      placeholder="Minimum 8 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground text-xs font-medium mb-1.5">
                    Confirmer
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm"
                    required
                    placeholder="Confirmer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mettre à jour"}
                </button>
              </form>
            </div>

            {/* Email */}
            <div className="bg-card/40 border border-border/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Changer l'email</h3>
              </div>

              {!showEmailConfirm ? (
                <form onSubmit={handleRequestEmailChange} className="space-y-3">
                  <div>
                    <label className="block text-muted-foreground text-xs font-medium mb-1.5">
                      Nouvel email
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="nouveau@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground text-xs font-medium mb-1.5">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer la demande"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmEmailChange} className="space-y-3">
                  <div>
                    <label className="block text-muted-foreground text-xs font-medium mb-1.5">
                      Token de vérification
                    </label>
                    <input
                      type="text"
                      value={emailToken}
                      onChange={(e) => setEmailToken(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none transition-all text-sm font-mono"
                      placeholder="Entrez le token reçu"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Un token a été envoyé à votre nouvel email.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmailConfirm(false)}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Annuler
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB : NOTIFICATIONS */}
        {/* ========================================== */}
        {activeTab === "notifications" && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-5 backdrop-blur-sm animate-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Gérez les notifications que vous recevez
            </p>

            <div>
              <Toggle
                value={notifSettings.newChapter}
                onChange={() =>
                  setNotifSettings({ ...notifSettings, newChapter: !notifSettings.newChapter })
                }
                label="Nouveau chapitre"
                description="Quand un manga suivi publie un chapitre"
              />
              <Toggle
                value={notifSettings.newComment}
                onChange={() =>
                  setNotifSettings({ ...notifSettings, newComment: !notifSettings.newComment })
                }
                label="Nouveau commentaire"
                description="Quand quelqu'un commente vos mangas"
              />
              <Toggle
                value={notifSettings.newSubscriber}
                onChange={() =>
                  setNotifSettings({
                    ...notifSettings,
                    newSubscriber: !notifSettings.newSubscriber,
                  })
                }
                label="Nouvel abonné"
                description="Quand quelqu'un s'abonne à vous"
              />
              <Toggle
                value={notifSettings.earning}
                onChange={() =>
                  setNotifSettings({ ...notifSettings, earning: !notifSettings.earning })
                }
                label="Revenus"
                description="Quand vous gagnez de l'argent"
              />
              <Toggle
                value={notifSettings.system}
                onChange={() =>
                  setNotifSettings({ ...notifSettings, system: !notifSettings.system })
                }
                label="Système"
                description="Notifications importantes"
              />
            </div>

            <button
              onClick={handleUpdateNotifications}
              disabled={saving}
              className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB : PREFERENCES */}
        {/* ========================================== */}
        {activeTab === "preferences" && (
          <div className="space-y-4 animate-in">
            {/* Theme */}
            <div className="bg-card/40 border border-border/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30">
                  <Palette className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Thème</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Choisissez l'apparence de l'application
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: "light", label: "Clair", icon: Sun, color: "amber" },
                  { value: "dark", label: "Sombre", icon: Moon, color: "blue" },
                  { value: "system", label: "Système", icon: Laptop, color: "purple" },
                ].map(({ value, label, icon: Icon, color }) => {
                  const isActive = preferences.theme === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value as "light" | "dark" | "system")}
                      disabled={saving}
                      className={`py-4 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-2 border-2 ${
                        isActive
                          ? `bg-${color}-500/15 border-${color}-500/50 text-${color}-400 shadow-lg`
                          : "bg-card/60 border-border text-muted-foreground hover:border-foreground/20 hover:bg-card/80"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language */}
            <div className="bg-card/40 border border-border/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                  <Languages className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Langue</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Choisissez la langue de l'application
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: "fr", label: "Français", flag: "🇫🇷" },
                  { value: "en", label: "English", flag: "🇬🇧" },
                ].map(({ value, label, flag }) => {
                  const isActive = preferences.language === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setPreferences({ ...preferences, language: value as "fr" | "en" })}
                      className={`py-4 rounded-2xl text-sm font-bold transition-all flex flex-col items-center gap-1.5 border-2 ${
                        isActive
                          ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                          : "bg-card/60 border-border text-muted-foreground hover:border-foreground/20 hover:bg-card/80"
                      }`}
                    >
                      <span className="text-2xl">{flag}</span>
                      {label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleUpdatePreferences}
                disabled={saving}
                className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer les préférences"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB : ADVANCED */}
        {/* ========================================== */}
        {activeTab === "advanced" && (
          <div className="space-y-4 animate-in">
            <div className="bg-card/40 border border-border/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-muted border border-border">
                  <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Actions avancées</h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleExportData}
                  disabled={saving}
                  className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl bg-card/60 hover:bg-card/80 transition-all border border-border/40 group"
                >
                  <span className="text-sm text-foreground flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    Exporter mes données
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl bg-card/60 hover:bg-card/80 transition-all border border-border/40 group"
                >
                  <span className="text-sm text-foreground flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-rose-400 transition-colors" />
                    Se déconnecter
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl bg-rose-950/20 hover:bg-rose-900/30 transition-all border border-rose-500/20 group"
                >
                  <span className="text-sm text-rose-400 flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4" />
                    Supprimer mon compte
                  </span>
                  <ChevronRight className="w-4 h-4 text-rose-400/50 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <p className="text-xs text-amber-300/80 text-center">
                  ⚠️ La suppression du compte est irréversible. Toutes vos données seront perdues.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      <BottomNav />

      {/* ===== ANIMATIONS ===== */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
