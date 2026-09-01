"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  BadgeCheck, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Users,
  BookOpen,
  Coins,
  Crown,
  UserX,
  UserPlus,
  Ticket,
  TrendingUp,
  Loader2,
  Search,
  Eye,
  EyeOff,
  Clock,
  Check,
  X,
  FileText,
  Sparkles,
  Zap,
  Rocket,
  Star,
  Award,
  Trophy,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  isCertified: boolean;
  premiumActive: boolean;
  createdAt: string;
  _count: {
    mangas: number;
    followers: number;
  };
};

type CreatorRequest = {
  id: string;
  userId: string;
  status: string;
  portfolioUrl: string | null;
  description: string | null;
  examples: string[];
  proofImages: string[];
  reviewNotes: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
};

type Event = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  theme: string | null;
  icon: string | null;
  coverUrl: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  config: any;
  rewards: any;
  objectives: any;
  createdAt: string;
  _count?: {
    participations: number;
  };
};

type Stats = {
  users: {
    total: number;
    creators: number;
    certified: number;
    premium: number;
  };
  content: {
    mangas: number;
    chapters: number;
    comments: number;
  };
  payments: {
    total: number;
    revenue: number;
  };
  requests: {
    pending: number;
  };
};

type Tab = "dashboard" | "users" | "requests" | "certify" | "events";

export default function AdminPanel() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; username: string; role: string; isCertified: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [requests, setRequests] = useState<CreatorRequest[]>([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
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
        await loadStats(token);
        await loadUsers(token);
        await loadRequests(token);
        await loadEvents(token);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const loadStats = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const loadUsers = async (token: string, page: number = 1) => {
    try {
      const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data);
        setUsersTotal(data.meta.total);
      }
    } catch (error) {
      console.error("Erreur chargement users:", error);
    }
  };

  const loadRequests = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/creator-requests?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data);
        setRequestsTotal(data.meta.total);
      }
    } catch (error) {
      console.error("Erreur chargement requests:", error);
    }
  };

  const loadEvents = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data || []);
        setEventsTotal(data.meta?.total || 0);
      }
    } catch (error) {
      console.error("Erreur chargement events:", error);
    }
  };

  const handleCertify = async (userId: string, certify: boolean = true) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/certify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, certify }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage(`Utilisateur ${certify ? "certifié" : "décertifié"} avec succès`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePromote = async (userId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/promote/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage(`Utilisateur promu créateur avec succès`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRevokeCreator = async (userId: string, reason: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/revoke/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage(`Statut de créateur révoqué`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async (userId: string, reason: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/suspend/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage(`Utilisateur suspendu avec succès`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleGrantPremium = async (userId: string, durationMonths: number = 1) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/grant-premium/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: "MONTHLY", durationMonths }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage(`Abonnement Premium offert (${durationMonths} mois)`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveRequest = async (requestId: string, reviewNotes?: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/creator-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewNotes }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage(`Demande approuvée`);
      await loadRequests(token);
      await loadStats(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/creator-requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage(`Demande refusée`);
      await loadRequests(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Gestion des événements
  const handleToggleEvent = async (eventId: string, isActive: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/events/${eventId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage(`Événement ${isActive ? "activé" : "désactivé"} avec succès`);
      await loadEvents(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Supprimer définitivement cet événement ?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur");

      setMessage("Événement supprimé avec succès");
      await loadEvents(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Admin Panel
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full space-y-6">

        {/* ALERTES */}
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ===== ADMIN INFO ===== */}
        <div className="bg-gradient-to-r from-zinc-900/60 via-blue-950/30 to-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-lg flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Administrateur
            </p>
            <p className="font-bold text-white text-lg flex items-center gap-2">
              {me?.username}
              {me?.isCertified && <BadgeCheck className="w-5 h-5 text-blue-400 fill-blue-500/20 animate-pulse" />}
              <span className="text-xs text-zinc-500 font-normal ml-1">Super Admin</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-400 border border-blue-500/30 font-medium flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              {me?.role}
            </span>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800/60 pb-3">
          {[
            { key: "dashboard", label: "Tableau de bord", icon: TrendingUp, color: "blue" },
            { key: "users", label: "Utilisateurs", icon: Users, color: "emerald" },
            { key: "requests", label: "Demandes", icon: FileText, color: "amber" },
            { key: "certify", label: "Certification", icon: BadgeCheck, color: "purple" },
            { key: "events", label: "Événements", icon: Trophy, color: "amber" },
          ].map((tab) => {
            const Icon = tab.icon;
            const colorMap: Record<string, string> = {
              blue: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30",
              emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30",
              amber: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30",
              purple: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30",
            };
            const inactiveColorMap: Record<string, string> = {
              blue: "hover:bg-blue-950/30 hover:text-blue-400 border-blue-500/20",
              emerald: "hover:bg-emerald-950/30 hover:text-emerald-400 border-emerald-500/20",
              amber: "hover:bg-amber-950/30 hover:text-amber-400 border-amber-500/20",
              purple: "hover:bg-purple-950/30 hover:text-purple-400 border-purple-500/20",
            };
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? colorMap[tab.color]
                    : `bg-zinc-900/60 text-zinc-400 hover:${inactiveColorMap[tab.color]} border border-zinc-800/50`
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && <Sparkles className="w-3 h-3 text-white/70 animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* ===== TAB: DASHBOARD ===== */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-950/40 to-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-blue-500/20 hover:shadow-lg">
                <div className="relative">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.users.total}</p>
                <p className="text-xs text-zinc-500 font-medium">Utilisateurs</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-emerald-500/20 hover:shadow-lg">
                <div className="relative">
                  <BookOpen className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" style={{ animationDelay: '0.3s' }} />
                </div>
                <p className="text-2xl font-bold text-white">{stats.content.mangas}</p>
                <p className="text-xs text-zinc-500 font-medium">Mangas</p>
              </div>
              <div className="bg-gradient-to-br from-amber-950/40 to-amber-900/20 border border-amber-500/30 rounded-xl p-4 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-amber-500/20 hover:shadow-lg">
                <div className="relative">
                  <Coins className="w-6 h-6 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDelay: '0.6s' }} />
                </div>
                <p className="text-2xl font-bold text-white">{stats.payments.revenue.toFixed(2)}$</p>
                <p className="text-xs text-zinc-500 font-medium">Revenus</p>
              </div>
              <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 border border-purple-500/30 rounded-xl p-4 text-center group hover:scale-[1.02] transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-lg">
                <div className="relative">
                  <Ticket className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-ping" style={{ animationDelay: '0.9s' }} />
                </div>
                <p className="text-2xl font-bold text-white">{stats.requests.pending}</p>
                <p className="text-xs text-zinc-500 font-medium">Demandes en attente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Statut des utilisateurs
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Créateurs</span>
                    <span className="text-blue-400 font-bold">{stats.users.creators}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Certifiés</span>
                    <span className="text-purple-400 font-bold">{stats.users.certified}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Premium</span>
                    <span className="text-amber-400 font-bold">{stats.users.premium}</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 hover:border-emerald-500/30 transition-colors">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  Contenu
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Chapitres</span>
                    <span className="text-emerald-400 font-bold">{stats.content.chapters}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Commentaires</span>
                    <span className="text-rose-400 font-bold">{stats.content.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: USERS ===== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-medium transition-all shadow-blue-900/30 shadow-lg flex items-center gap-2">
                <Search className="w-4 h-4" />
                Rechercher
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800/60">
                  <tr>
                    <th className="text-left py-3 px-3 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-3 font-medium">Rôle</th>
                    <th className="text-left py-3 px-3 font-medium">Statut</th>
                    <th className="text-left py-3 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className={`border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors ${index % 2 === 0 ? 'bg-zinc-900/20' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            user.role === "ADMIN" ? "bg-gradient-to-br from-rose-600 to-rose-500" :
                            user.role === "CREATOR" ? "bg-gradient-to-br from-blue-600 to-blue-500" :
                            "bg-gradient-to-br from-zinc-700 to-zinc-600"
                          }`}>
                            {user.username?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-1.5">
                              {user.username}
                              {user.isCertified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />}
                            </p>
                            <p className="text-zinc-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.role === "ADMIN" ? "bg-gradient-to-r from-rose-600/30 to-rose-500/20 text-rose-400 border border-rose-500/30" :
                          user.role === "CREATOR" ? "bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-400 border border-blue-500/30" :
                          user.role === "SUSPENDED" ? "bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-400 border border-amber-500/30" :
                          "bg-zinc-700/30 text-zinc-400 border border-zinc-600/30"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 text-xs">
                          {user.isCertified && (
                            <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                              <BadgeCheck className="w-3 h-3" />
                              Certifié
                            </span>
                          )}
                          {user.premiumActive && (
                            <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <Crown className="w-3 h-3" />
                              Premium
                            </span>
                          )}
                          {user._count.mangas > 0 && (
                            <span className="text-zinc-500 bg-zinc-800/30 px-2 py-0.5 rounded-full border border-zinc-700/30">
                              {user._count.mangas} mangas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleCertify(user.id, !user.isCertified)}
                            disabled={processing}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                              user.isCertified 
                                ? "text-blue-400 hover:bg-blue-950/40 hover:scale-110" 
                                : "text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30 hover:scale-110"
                            }`}
                            title={user.isCertified ? "Décertifier" : "Certifier"}
                          >
                            <BadgeCheck className="w-4 h-4" />
                          </button>
                          {user.role !== "CREATOR" && user.role !== "ADMIN" && (
                            <button
                              onClick={() => handlePromote(user.id)}
                              disabled={processing}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/30 hover:scale-110 transition-all duration-200"
                              title="Promouvoir créateur"
                            >
                              <Rocket className="w-4 h-4" />
                            </button>
                          )}
                          {user.role === "CREATOR" && (
                            <button
                              onClick={() => {
                                const reason = prompt("Raison de la révocation :");
                                if (reason) handleRevokeCreator(user.id, reason);
                              }}
                              disabled={processing}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30 hover:scale-110 transition-all duration-200"
                              title="Révoquer créateur"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          {user.role !== "SUSPENDED" && user.role !== "ADMIN" && (
                            <button
                              onClick={() => {
                                const reason = prompt("Raison de la suspension :");
                                if (reason) handleSuspend(user.id, reason);
                              }}
                              disabled={processing}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 hover:scale-110 transition-all duration-200"
                              title="Suspendre"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const months = parseInt(prompt("Nombre de mois Premium (1-12) :") || "1");
                              if (months > 0) handleGrantPremium(user.id, months);
                            }}
                            disabled={processing}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30 hover:scale-110 transition-all duration-200"
                            title="Offrir Premium"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-zinc-500 text-xs flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              Total : {usersTotal} utilisateurs
            </p>
          </div>
        )}

        {/* ===== TAB: REQUESTS ===== */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
                <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 font-medium">Aucune demande en attente</p>
                <p className="text-zinc-500 text-xs mt-1">Toutes les demandes ont été traitées.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-gradient-to-r from-zinc-900/40 to-zinc-900/20 border border-zinc-800/80 rounded-xl p-4 space-y-3 hover:border-amber-500/30 transition-all duration-300 hover:shadow-amber-500/10 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400 border border-amber-500/30">
                        {req.user.username?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-white font-bold flex items-center gap-2">
                          {req.user.username}
                          <span className="text-xs text-zinc-500 font-normal">@{req.user.email}</span>
                        </p>
                        <p className="text-zinc-500 text-xs flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Demandé le {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3 h-3" />
                      En attente
                    </span>
                  </div>
                  {req.description && (
                    <p className="text-zinc-400 text-sm bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/40">
                      "{req.description}"
                    </p>
                  )}
                  {req.examples && req.examples.length > 0 && (
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <span>📎</span>
                      <span>{req.examples.length} exemple{req.examples.length > 1 ? 's' : ''} fourni{req.examples.length > 1 ? 's' : ''}</span>
                      {req.examples.length > 0 && (
                        <span className="text-zinc-600 text-[10px] truncate max-w-[200px]">{req.examples[0]}</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        const notes = prompt("Notes de l'administrateur :");
                        handleApproveRequest(req.id, notes || undefined);
                      }}
                      disabled={processing}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-medium transition-all shadow-emerald-900/30 shadow-lg flex items-center gap-1.5 hover:scale-[1.02]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approuver
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Raison du refus :");
                        if (reason) handleRejectRequest(req.id, reason);
                      }}
                      disabled={processing}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-medium transition-all shadow-rose-900/30 shadow-lg flex items-center gap-1.5 hover:scale-[1.02]"
                    >
                      <X className="w-3.5 h-3.5" />
                      Refuser
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== TAB: CERTIFY ===== */}
        {activeTab === "certify" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-zinc-900/40 to-purple-950/20 border border-purple-500/30 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Certification</p>
                  <p className="text-sm text-zinc-300">Attribuer le badge de certification à un utilisateur</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ID de l'utilisateur..."
                  value={selectedUser || ""}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm"
                />
                <button
                  onClick={() => {
                    if (selectedUser) {
                      if (confirm("Certifier cet utilisateur ?")) {
                        handleCertify(selectedUser, true);
                      }
                    }
                  }}
                  disabled={processing || !selectedUser}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium transition-all shadow-purple-900/30 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-[1.02]"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Certifier
                </button>
              </div>
              <p className="text-zinc-500 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                Entrez l'ID d'un utilisateur pour le certifier. Il recevra un badge spécial.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-950/30 to-blue-900/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <BadgeCheck className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-zinc-400">Certifié</p>
              </div>
              <div className="bg-gradient-to-br from-purple-950/30 to-purple-900/10 border border-purple-500/20 rounded-xl p-3 text-center">
                <Star className="w-8 h-8 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-zinc-400">Star</p>
              </div>
              <div className="bg-gradient-to-br from-amber-950/30 to-amber-900/10 border border-amber-500/20 rounded-xl p-3 text-center">
                <Crown className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-zinc-400">Premium</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: EVENTS ===== */}
        {activeTab === "events" && (
          <div className="space-y-4">
            {/* Bouton Ajouter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Gérez les événements de la plateforme</span>
              </div>
              <button
                onClick={() => {
                  alert("📝 Formulaire de création d'événement à implémenter");
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-medium transition-all shadow-amber-900/30 shadow-lg flex items-center gap-2 hover:scale-[1.02]"
              >
                <Rocket className="w-4 h-4" />
                Nouvel événement
              </button>
            </div>

            {/* Liste des événements */}
            {events.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
                <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 font-medium">Aucun événement</p>
                <p className="text-zinc-500 text-xs mt-1">Créez votre premier événement pour engager la communauté.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const isActive = event.isActive;
                  const now = new Date();
                  const start = new Date(event.startDate);
                  const end = new Date(event.endDate);
                  const isOngoing = start <= now && end >= now;
                  const isUpcoming = start > now;
                  const isPast = end < now;

                  let statusText = "Terminé";
                  let statusColor = "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
                  if (isOngoing && isActive) {
                    statusText = "En cours";
                    statusColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                  } else if (isUpcoming && isActive) {
                    statusText = "À venir";
                    statusColor = "bg-blue-500/20 text-blue-400 border-blue-500/30";
                  } else if (isPast && isActive) {
                    statusText = "Terminé";
                    statusColor = "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
                  } else if (!isActive) {
                    statusText = "Désactivé";
                    statusColor = "bg-rose-500/20 text-rose-400 border-rose-500/30";
                  }

                  return (
                    <div
                      key={event.id}
                      className={`bg-gradient-to-r from-zinc-900/40 to-zinc-900/20 border rounded-xl p-4 space-y-3 transition-all duration-300 ${
                        isActive && isOngoing
                          ? "border-emerald-500/40 hover:border-emerald-500/60 hover:shadow-emerald-500/10 hover:shadow-lg"
                          : "border-zinc-800/80 hover:border-amber-500/30 hover:shadow-amber-500/10 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            isActive && isOngoing
                              ? "bg-emerald-600/30 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-700/30 text-zinc-400 border-zinc-600/30"
                          }`}>
                            <Trophy className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-bold flex items-center gap-2">
                              {event.title}
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>
                                {statusText}
                              </span>
                            </p>
                            <p className="text-zinc-500 text-xs flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Du {new Date(event.startDate).toLocaleDateString()} au {new Date(event.endDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event._count?.participations || 0} participants
                              </span>
                              <span className="text-zinc-600 text-[10px] uppercase">
                                {event.type}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleEvent(event.id, !isActive)}
                            disabled={processing}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                              isActive
                                ? "text-emerald-400 hover:bg-emerald-950/30"
                                : "text-rose-400 hover:bg-rose-950/30"
                            }`}
                            title={isActive ? "Désactiver" : "Activer"}
                          >
                            {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={processing}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all duration-200"
                            title="Supprimer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-zinc-400 text-sm bg-zinc-800/30 rounded-lg p-2 border border-zinc-800/40 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {eventsTotal > 0 && (
              <p className="text-zinc-500 text-xs flex items-center gap-1.5">
                <Trophy className="w-3 h-3" />
                Total : {eventsTotal} événements
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
