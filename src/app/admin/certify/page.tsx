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
  XCircle,
  Eye,
  EyeOff,
  Clock,
  Check,
  X,
  FileText,
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

type Tab = "dashboard" | "users" | "requests" | "certify" | "moderation";

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
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [moderationReason, setModerationReason] = useState("");

  // ============================================
  // RÉCUPÉRER L'UTILISATEUR CONNECTÉ
  // ============================================
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  // ============================================
  // CHARGER LES STATISTIQUES
  // ============================================
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

  // ============================================
  // CHARGER LES UTILISATEURS
  // ============================================
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

  // ============================================
  // CHARGER LES DEMANDES DE CRÉATEUR
  // ============================================
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

  // ============================================
  // CERTIFIER UN UTILISATEUR
  // ============================================
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

      setMessage(`✅ Utilisateur ${certify ? "certifié" : "décertifié"} avec succès`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // PROMOUVOIR EN CRÉATEUR
  // ============================================
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

      setMessage(`✅ Utilisateur promu créateur avec succès`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // RÉVOQUER LE STATUT DE CRÉATEUR
  // ============================================
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

      setMessage(`✅ Statut de créateur révoqué`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // SUSPENDRE / RÉACTIVER UN UTILISATEUR
  // ============================================
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

      setMessage(`✅ Utilisateur suspendu avec succès`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // ACCORDER PREMIUM
  // ============================================
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

      setMessage(`✅ Abonnement Premium offert (${durationMonths} mois)`);
      await loadStats(token);
      await loadUsers(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // APPOUVER UNE DEMANDE DE CRÉATEUR
  // ============================================
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

      setMessage(`✅ Demande approuvée !`);
      await loadRequests(token);
      await loadStats(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // REFUSER UNE DEMANDE DE CRÉATEUR
  // ============================================
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

      setMessage(`❌ Demande refusée`);
      await loadRequests(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // SPINNER DE CHARGEMENT
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ============================================
  // ÉCRAN D'ACCÈS REFUSÉ
  // ============================================
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

        {/* ===== ADMIN INFO ===== */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Administrateur</p>
            <p className="font-bold text-white text-lg flex items-center gap-2">
              {me?.username}
              {me?.isCertified && <BadgeCheck className="w-5 h-5 text-blue-400 fill-blue-500/20" />}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-medium">
              {me?.role}
            </span>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800/60 pb-3">
          {[
            { key: "dashboard", label: "Tableau de bord", icon: TrendingUp },
            { key: "users", label: "Utilisateurs", icon: Users },
            { key: "requests", label: "Demandes", icon: FileText },
            { key: "certify", label: "Certification", icon: BadgeCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-zinc-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ===== TAB: DASHBOARD ===== */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.users.total}</p>
                <p className="text-xs text-zinc-500">Utilisateurs</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
                <BookOpen className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.content.mangas}</p>
                <p className="text-xs text-zinc-500">Mangas</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
                <Coins className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.payments.revenue.toFixed(2)}$</p>
                <p className="text-xs text-zinc-500">Revenus</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
                <Ticket className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.requests.pending}</p>
                <p className="text-xs text-zinc-500">Demandes en attente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3">Statut des utilisateurs</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Créateurs</span>
                    <span className="text-white font-bold">{stats.users.creators}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Certifiés</span>
                    <span className="text-white font-bold">{stats.users.certified}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Premium</span>
                    <span className="text-white font-bold">{stats.users.premium}</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3">Contenu</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Chapitres</span>
                    <span className="text-white font-bold">{stats.content.chapters}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Commentaires</span>
                    <span className="text-white font-bold">{stats.content.comments}</span>
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
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
              <button className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all">
                <Search className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-500 border-b border-zinc-800/60">
                  <tr>
                    <th className="text-left py-3 font-medium">Utilisateur</th>
                    <th className="text-left py-3 font-medium">Rôle</th>
                    <th className="text-left py-3 font-medium">Statut</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                            {user.username?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-zinc-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "ADMIN" ? "bg-red-600/20 text-red-400" :
                          user.role === "CREATOR" ? "bg-blue-600/20 text-blue-400" :
                          user.role === "SUSPENDED" ? "bg-amber-600/20 text-amber-400" :
                          "bg-zinc-600/20 text-zinc-400"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2 text-xs">
                          {user.isCertified && <BadgeCheck className="w-4 h-4 text-blue-400" />}
                          {user.premiumActive && <Crown className="w-4 h-4 text-amber-400" />}
                          {user._count.mangas > 0 && <span className="text-zinc-500">{user._count.mangas} mangas</span>}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => handleCertify(user.id, !user.isCertified)}
                            disabled={processing}
                            className={`p-1.5 rounded-lg transition-all ${
                              user.isCertified ? "text-blue-400 hover:bg-blue-950/30" : "text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30"
                            }`}
                            title={user.isCertified ? "Décertifier" : "Certifier"}
                          >
                            <BadgeCheck className="w-4 h-4" />
                          </button>
                          {user.role !== "CREATOR" && user.role !== "ADMIN" && (
                            <button
                              onClick={() => handlePromote(user.id)}
                              disabled={processing}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/30 transition-all"
                              title="Promouvoir créateur"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          {user.role === "CREATOR" && (
                            <button
                              onClick={() => {
                                const reason = prompt("Raison de la révocation :");
                                if (reason) handleRevokeCreator(user.id, reason);
                              }}
                              disabled={processing}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30 transition-all"
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
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
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
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30 transition-all"
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
            <p className="text-zinc-500 text-xs">Total : {usersTotal} utilisateurs</p>
          </div>
        )}

        {/* ===== TAB: REQUESTS ===== */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                <p>Aucune demande en attente</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white">
                        {req.user.username?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-white font-bold">{req.user.username}</p>
                        <p className="text-zinc-500 text-xs">{req.user.email}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-600/20 text-amber-400 border border-amber-500/30">
                      En attente
                    </span>
                  </div>
                  {req.description && (
                    <p className="text-zinc-400 text-sm">{req.description}</p>
                  )}
                  {req.examples && req.examples.length > 0 && (
                    <p className="text-zinc-500 text-xs">📎 {req.examples.length} exemples</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const notes = prompt("Notes de l'administrateur :");
                        handleApproveRequest(req.id, notes || undefined);
                      }}
                      disabled={processing}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all flex items-center gap-1.5"
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
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all flex items-center gap-1.5"
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
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 md:p-6 space-y-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Certifier un utilisateur
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ID de l'utilisateur..."
                  value={selectedUser || ""}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
                  Certifier
                </button>
              </div>
              <p className="text-zinc-500 text-xs">Entrez l'ID d'un utilisateur pour le certifier.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
