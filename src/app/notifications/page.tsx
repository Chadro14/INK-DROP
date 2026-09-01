"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Check,
  Clock,
  Trophy,
  Crown,
  Coins,
  Ticket,
  Sparkles,
  Users,
  BookOpen,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  metadata: any;
  createdAt: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/notifications?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur de chargement");

        const data = await res.json();
        setNotifications(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [router]);

  const getFilteredNotifications = () => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  };

  const markAsRead = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur");

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Erreur marquage comme lu:", err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur");

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setMessage("✅ Toutes les notifications ont été marquées comme lues");
    } catch (err) {
      console.error("Erreur marquage tout comme lu:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setDeletingId(notificationId);

    try {
      const res = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur");

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      setMessage("✅ Notification supprimée");
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_CHAPTER":
        return BookOpen;
      case "NEW_COMMENT":
        return Users;
      case "NEW_SUBSCRIBER":
        return Users;
      case "EARNING":
        return Coins;
      case "CERTIFICATION":
        return Crown;
      case "PREMIUM_EXPIRY":
        return Clock;
      case "EVENT_STARTED":
      case "EVENT_ENDED":
      case "EVENT_REWARD":
      case "EVENT_REMINDER":
        return Trophy;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "NEW_CHAPTER":
        return "text-blue-400 bg-blue-950/30 border-blue-500/30";
      case "NEW_COMMENT":
        return "text-emerald-400 bg-emerald-950/30 border-emerald-500/30";
      case "NEW_SUBSCRIBER":
        return "text-purple-400 bg-purple-950/30 border-purple-500/30";
      case "EARNING":
        return "text-amber-400 bg-amber-950/30 border-amber-500/30";
      case "CERTIFICATION":
        return "text-rose-400 bg-rose-950/30 border-rose-500/30";
      case "PREMIUM_EXPIRY":
        return "text-orange-400 bg-orange-950/30 border-orange-500/30";
      case "EVENT_STARTED":
        return "text-emerald-400 bg-emerald-950/30 border-emerald-500/30";
      case "EVENT_ENDED":
        return "text-zinc-400 bg-zinc-950/30 border-zinc-500/30";
      case "EVENT_REWARD":
        return "text-amber-400 bg-amber-950/30 border-amber-500/30";
      case "EVENT_REMINDER":
        return "text-blue-400 bg-blue-950/30 border-blue-500/30";
      default:
        return "text-zinc-400 bg-zinc-950/30 border-zinc-500/30";
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader label="Chargement des notifications..." />
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white pb-24">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 md:px-8 py-6 flex flex-col gap-4">

        {/* ALERTES */}
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/50"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === "unread"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/50"
              }`}
            >
              Non lues {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Tout lire
            </button>
          )}
        </div>

        {/* LISTE DES NOTIFICATIONS */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800/40">
            <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">
              {filter === "unread"
                ? "Aucune notification non lue"
                : "Aucune notification"}
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              {filter === "unread"
                ? "Vous avez lu toutes vos notifications"
                : "Les notifications apparaîtront ici"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);
              const isUnread = !notification.isRead;

              return (
                <div
                  key={notification.id}
                  className={`relative bg-zinc-900/40 border rounded-2xl p-4 transition-all group hover:border-blue-500/30 ${
                    isUnread
                      ? "border-blue-500/40 bg-blue-950/10"
                      : "border-zinc-800/60"
                  }`}
                >
                  {isUnread && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl border ${iconColor} shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm font-semibold ${
                            isUnread ? "text-white" : "text-zinc-400"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap shrink-0">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {notification.body && (
                        <p
                          className={`text-sm mt-0.5 ${
                            isUnread ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {notification.body}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                          >
                            Voir détails
                          </Link>
                        )}

                        {isUnread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Marquer comme lu
                          </button>
                        )}

                        <button
                          onClick={() => deleteNotification(notification.id)}
                          disabled={deletingId === notification.id}
                          className="text-xs text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
