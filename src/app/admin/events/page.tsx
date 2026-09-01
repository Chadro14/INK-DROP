"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Trophy,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

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
  rewards: any[];
  objectives: any[];
  _count?: {
    participations: number;
    submissions: number;
  };
  createdAt: string;
};

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Non authentifié");
        }

        const data = await res.json();

        if (data.role !== "ADMIN") {
          setError("Accès réservé aux administrateurs");
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        await fetchEvents(token);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const fetchEvents = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/events?filter=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors du chargement des événements");

      const data = await res.json();
      setEvents(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setDeletingId(eventId);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la suppression");
      }

      setMessage("✅ Événement supprimé avec succès");
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }

      setMessage(
        `✅ Événement ${!currentStatus ? "activé" : "désactivé"} avec succès`
      );
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, isActive: !currentStatus } : e
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BATTLE: "⚔️ Battle",
      DESSIN: "🎨 Défi Dessin",
      TICKETS: "🎟️ Tickets",
      RISING_CREATOR: "🚀 Rising Creator",
      AWARDS: "👑 Awards",
      TOURNAMENT: "💥 Tournament",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (!event.isActive) {
      return { label: "Désactivé", color: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" };
    }
    if (start > now) {
      return { label: "À venir", color: "bg-blue-600/20 text-blue-400 border-blue-500/30" };
    }
    if (end < now) {
      return { label: "Terminé", color: "bg-zinc-600/20 text-zinc-400 border-zinc-600/30" };
    }
    return { label: "En cours", color: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 animate-pulse" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center text-white space-y-4">
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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-10">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link
            href="/profile"
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Admin Événements
          </span>
          <Link
            href="/admin/events/create"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel événement
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full">
        {/* ALERTES */}
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 shadow-lg mb-6">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg mb-6">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{events.length}</p>
            <p className="text-xs text-zinc-500">Total</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {events.filter((e) => {
                const now = new Date();
                const start = new Date(e.startDate);
                const end = new Date(e.endDate);
                return e.isActive && start <= now && end >= now;
              }).length}
            </p>
            <p className="text-xs text-zinc-500">En cours</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {events.reduce((acc, e) => acc + (e._count?.participations || 0), 0)}
            </p>
            <p className="text-xs text-zinc-500">Participants</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-center">
            <Eye className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {events.filter((e) => e.isActive).length}
            </p>
            <p className="text-xs text-zinc-500">Actifs</p>
          </div>
        </div>

        {/* LISTE */}
        {events.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">Aucun événement</p>
            <Link
              href="/admin/events/create"
              className="mt-4 inline-block px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Créer le premier événement
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800/60">
                <tr>
                  <th className="text-left py-3 px-3 font-medium">Événement</th>
                  <th className="text-left py-3 px-3 font-medium">Type</th>
                  <th className="text-left py-3 px-3 font-medium">Dates</th>
                  <th className="text-left py-3 px-3 font-medium">Statut</th>
                  <th className="text-left py-3 px-3 font-medium">Participants</th>
                  <th className="text-left py-3 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const status = getStatusBadge(event);
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div>
                          <p className="text-white font-medium">{event.title}</p>
                          {event.description && (
                            <p className="text-zinc-500 text-xs truncate max-w-[200px]">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs">{getTypeLabel(event.type)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-xs text-zinc-400">
                          <p>{new Date(event.startDate).toLocaleDateString()}</p>
                          <p className="text-zinc-500">
                            {new Date(event.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-white font-medium">
                          {event._count?.participations || 0}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30 transition-all"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => toggleEventStatus(event.id, event.isActive)}
                            className={`p-1.5 rounded-lg transition-all ${
                              event.isActive
                                ? "text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30"
                                : "text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/30"
                            }`}
                            title={event.isActive ? "Désactiver" : "Activer"}
                          >
                            {event.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={deletingId === event.id}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === event.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/events/${event.id}`}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30 transition-all"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
