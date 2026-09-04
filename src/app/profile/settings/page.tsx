"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
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

export default function SettingsPage() {
  const router = useRouter();
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

  // ===== APPLY THEME =====
  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
  };

  // ===== LOAD USER DATA =====
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
          setPreferences(data.preferences);
          if (data.preferences.theme) {
            applyTheme(data.preferences.theme);
          }
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== CHANGE PASSWORD =====
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
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
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error");
      }

      setSuccess("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ===== CHANGE EMAIL =====
  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!newEmail || !emailPassword) {
      setError("Please fill in all fields");
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

      if (!res.ok) {
        throw new Error(data.message || "Error");
      }

      setSuccess("Verification email sent");
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
    setError("");
    setSuccess("");

    if (!emailToken) {
      setError("Token required");
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

      if (!res.ok) {
        throw new Error(data.message || "Invalid token");
      }

      setSuccess("Email updated successfully");
      setEmailToken("");
      setShowEmailConfirm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ===== UPDATE NOTIFICATIONS =====
  const handleUpdateNotifications = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

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

      if (!res.ok) {
        throw new Error(data.message || "Error");
      }

      setSuccess("Notifications updated");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ===== UPDATE PREFERENCES =====
  const handleUpdatePreferences = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) return;

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
        throw new Error(data.message || "Error");
      }

      if (preferences.theme) {
        applyTheme(preferences.theme);
      }

      setSuccess("Preferences updated");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ===== CHANGE THEME =====
  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const updatedPreferences = {
        ...preferences,
        theme: theme,
      };

      const res = await fetch(`${API_URL}/users/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPreferences),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error");
      }

      setPreferences(updatedPreferences);
      applyTheme(theme === "light" ? "light" : "dark");
      setSuccess(`Theme ${theme === "light" ? "light" : "dark"} activated`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ===== DELETE ACCOUNT =====
  const handleDeleteAccount = async () => {
    const password = prompt("Enter your password to confirm:");
    if (!password) return;

    if (!confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

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

      if (!res.ok) {
        throw new Error(data.message || "Error");
      }

      localStorage.removeItem("token");
      setSuccess("Account deleted");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ===== EXPORT DATA =====
  const handleExportData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inkdrop-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccess("Data exported");
    } catch {
      setError("Export error");
    } finally {
      setSaving(false);
    }
  };

  // ===== TOGGLE COMPONENT =====
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
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/40 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
          value ? "bg-blue-600" : "bg-zinc-700"
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
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/profile"
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight">Settings</span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">

        {/* ===== ALERTS ===== */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ===== TAB MENU ===== */}
        <div className="grid grid-cols-5 gap-1 mb-6 bg-zinc-900/40 rounded-xl p-1 border border-zinc-800/60">
          {[
            { id: "account", icon: User, label: "Account" },
            { id: "security", icon: Shield, label: "Security" },
            { id: "notifications", icon: Bell, label: "Notifications" },
            { id: "preferences", icon: Palette, label: "Appearance" },
            { id: "advanced", icon: SettingsIcon, label: "Advanced" },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================== */}
        {/* TAB 1 : ACCOUNT */}
        {/* ========================================== */}
        {activeTab === "account" && (
          <div className="space-y-3">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-zinc-800/40">
                  <span className="text-zinc-400 text-sm">Email</span>
                  <span className="text-white text-sm font-medium">
                    {user?.email || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800/40">
                  <span className="text-zinc-400 text-sm">Username</span>
                  <span className="text-white text-sm font-medium">
                    {user?.username || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800/40">
                  <span className="text-zinc-400 text-sm">Role</span>
                  <span className="text-white text-sm font-medium">
                    {user?.role === "ADMIN"
                      ? "Administrator"
                      : user?.role === "CREATOR"
                      ? "Creator"
                      : "Reader"}
                  </span>
                </div>
                {user?.isCertified && (
                  <div className="flex justify-between py-2 border-b border-zinc-800/40">
                    <span className="text-zinc-400 text-sm">Certified</span>
                    <span className="text-blue-400 text-sm font-medium flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      Yes
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2 : SECURITY */}
        {/* ========================================== */}
        {activeTab === "security" && (
          <div className="space-y-3">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                Change Password
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-zinc-300 text-xs font-medium mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                      required
                      minLength={8}
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-300 text-xs font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                    required
                    placeholder="Confirm password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
                </button>
              </form>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                Change Email
              </h3>
              {!showEmailConfirm ? (
                <form onSubmit={handleRequestEmailChange} className="space-y-3">
                  <div>
                    <label className="block text-zinc-300 text-xs font-medium mb-1">
                      New Email
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="new@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 text-xs font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmEmailChange} className="space-y-3">
                  <div>
                    <label className="block text-zinc-300 text-xs font-medium mb-1">
                      Verification Token
                    </label>
                    <input
                      type="text"
                      value={emailToken}
                      onChange={(e) => setEmailToken(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 outline-none transition-all text-sm"
                      placeholder="Enter the token received by email"
                      required
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      A token has been sent to your new email address.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailConfirm(false)}
                    className="w-full py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3 : NOTIFICATIONS */}
        {/* ========================================== */}
        {activeTab === "notifications" && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              Notifications
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Manage the notifications you receive
            </p>

            <div className="divide-y divide-zinc-800/40">
              <Toggle
                value={notifSettings.newChapter}
                onChange={() =>
                  setNotifSettings({
                    ...notifSettings,
                    newChapter: !notifSettings.newChapter,
                  })
                }
                label="New Chapter"
                description="When a followed manga publishes a chapter"
              />
              <Toggle
                value={notifSettings.newComment}
                onChange={() =>
                  setNotifSettings({
                    ...notifSettings,
                    newComment: !notifSettings.newComment,
                  })
                }
                label="New Comment"
                description="When someone comments on your mangas"
              />
              <Toggle
                value={notifSettings.newSubscriber}
                onChange={() =>
                  setNotifSettings({
                    ...notifSettings,
                    newSubscriber: !notifSettings.newSubscriber,
                  })
                }
                label="New Subscriber"
                description="When someone subscribes to you"
              />
              <Toggle
                value={notifSettings.earning}
                onChange={() =>
                  setNotifSettings({
                    ...notifSettings,
                    earning: !notifSettings.earning,
                  })
                }
                label="Earnings"
                description="When you earn money"
              />
              <Toggle
                value={notifSettings.system}
                onChange={() =>
                  setNotifSettings({
                    ...notifSettings,
                    system: !notifSettings.system,
                  })
                }
                label="System"
                description="Important notifications"
              />
            </div>

            <button
              onClick={handleUpdateNotifications}
              disabled={saving}
              className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4 : PREFERENCES */}
        {/* ========================================== */}
        {activeTab === "preferences" && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-400" />
              Appearance & Language
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Customize the application display
            </p>

            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="block text-zinc-300 text-xs font-medium mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Laptop },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value as "light" | "dark" | "system")}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                        preferences.theme === value
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-zinc-300 text-xs font-medium mb-2">Language</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "fr", label: "Francais" },
                    { value: "en", label: "English" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          language: value as Preferences["language"],
                        })
                      }
                      className={`py-2.5 rounded-xl text-xs font-medium transition-all border ${
                        preferences.language === value
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleUpdatePreferences}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5 : ADVANCED */}
        {/* ========================================== */}
        {activeTab === "advanced" && (
          <div className="space-y-3">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-blue-400" />
                Advanced Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={handleExportData}
                  disabled={saving}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 transition-all border border-zinc-800/40"
                >
                  <span className="text-sm text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-zinc-400" />
                    Export My Data
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 transition-all border border-zinc-800/40"
                >
                  <span className="text-sm text-white flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-zinc-400" />
                    Log Out
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>

                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-rose-950/30 hover:bg-rose-900/30 transition-all border border-rose-500/20"
                >
                  <span className="text-sm text-rose-400 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </span>
                  <ChevronRight className="w-4 h-4 text-rose-400/50" />
                </button>
              </div>

              <p className="text-xs text-zinc-500 mt-4 text-center">
                Account deletion is irreversible. All your data will be lost.
              </p>
            </div>
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
