"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Bell,
  Check,
  Trash2,
  CheckCheck,
  Clock,
  MessageCircle,
  Heart,
  Users,
  DollarSign,
  Crown,
  AlertCircle,
  Sparkles,
  FileText,
  UserPlus,
  Settings,
  ChevronRight,
  Inbox,
  Circle,
  CircleCheck,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================
  // CHARGER LES NOTIFICATIONS
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Erreur de chargement");
      }

      const data = await res.json();
      setNotifications(data.data || []);
      setUnreadCount(data.data?.filter((n: Notification) => !n.isRead).length || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MARQUER COMME LU
  // ============================================
  const markAsRead = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erreur marquage lu:", error);
    }
  };

  // ============================================
  // TOUT MARQUER COMME LU
  // ============================================
  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        setSuccess("Toutes les notifications ont été marquées comme lues");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Erreur marquage tout lu:", error);
    }
  };

  // ============================================
  // SUPPRIMER UNE NOTIFICATION
  // ============================================
  const deleteNotification = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (!notifications.find((n) => n.id === id)?.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  // ============================================
  // FORMATER LA DATE
  // ============================================
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR");
  };

  // ============================================
  // ICÔNE PAR TYPE
  // ============================================
  const getIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      NEW_CHAPTER: FileText,
      NEW_COMMENT: MessageCircle,
      NEW_SUBSCRIBER: UserPlus,
      EARNING: DollarSign,
      CERTIFICATION: Crown,
      PREMIUM_EXPIRY: AlertCircle,
      SYSTEM: Bell,
    };
    const Icon = iconMap[type] || Bell;
    return Icon;
  };

  // ============================================
  // COULEUR PAR TYPE
  // ============================================
  const getColor = (type: string) => {
    const colorMap: Record<string, string> = {
      NEW_CHAPTER: "text-blue-400 bg-blue-500/20",
      NEW_COMMENT: "text-emerald-400 bg-emerald-500/20",
      NEW_SUBSCRIBER: "text-purple-400 bg-purple-500/20",
      EARNING: "text-amber-400 bg-amber-500/20",
      CERTIFICATION: "text-rose-400 bg-rose-500/20",
      PREMIUM_EXPIRY: "text-orange-400 bg-orange-500/20",
      SYSTEM: "text-zinc-400 bg-zinc-500/20",
    };
    return colorMap[type] || "text-zinc-400 bg-zinc-500/20";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader size={32} color="#3B82F6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span className="text-base font-bold tracking-tight text-white/90">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Tout lire</span>
          </button>
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-20 md:h-28 w-full bg-gradient-to-r from-zinc-950 via-blue-950/30 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_50%)]" />
      </div>

      {/* CONTENU */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 -mt-6">

        {/* SUCCÈS */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* ERREUR */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* LISTE */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Aucune notification</h3>
            <p className="text-zinc-400 text-sm max-w-sm">
              Vous serez informé ici des nouveautés sur INKDROP
            </p>
            <Link
              href="/discover"
              className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Découvrir des mangas
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = getIcon(notif.type);
              const colorClass = getColor(notif.type);

              return (
                <div
                  key={notif.id}
                  className={`group p-4 rounded-2xl border transition-all ${
                    notif.isRead
                      ? "bg-zinc-900/30 border-zinc-800/40"
                      : "bg-zinc-900/60 border-blue-500/30 shadow-lg shadow-blue-500/5"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* ICÔNE */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* CONTENU */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className={`text-sm font-semibold ${notif.isRead ? "text-zinc-400" : "text-white"}`}>
                            {notif.title}
                          </h4>
                          <p className="text-sm text-zinc-400 mt-0.5">{notif.body}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(notif.createdAt)}
                            </span>
                            {!notif.isRead && (
                              <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                <Circle className="w-2 h-2 fill-blue-400" />
                                Nouveau
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                              title="Marquer comme lu"
                            >
                              <CircleCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all opacity-0 group-hover:opacity-100"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* LIEN (si présent) */}
                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Voir plus
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PIED DE PAGE */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-600">
            ✦ XELIRA veille sur vos notifications ✦
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
